import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildExtractionPrompt } from "../lib/prompt";
import { log } from "../utils/logger";
import { logExtraction } from "../utils/extractionLogger";
import type {
  ExtractionResult,
  ExtractedEvent,
  ExtractedParty,
  ExtractedPayment,
  MissingDocument,
} from "../types/extraction";

function baseResult(): ExtractionResult {
  return {
    events: [],
    parties: [],
    payments: [],
    missingDocuments: [],
    generatedAt: new Date().toISOString(),
    engine: "gemini-structured",
    confidence: 0,
  };
}

function stripCodeFences(s: string): string {
  return s.replace(/^```[a-zA-Z]*\n?/m, "").replace(/```\s*$/m, "");
}

function safeJSONParse(text: string): any | null {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const slice = start !== -1 && end !== -1 ? text.slice(start, end + 1) : text;
    return JSON.parse(slice);
  } catch (e) {
    return null;
  }
}

function asArray<T>(v: any): T[] {
  return Array.isArray(v) ? v : [];
}

function normalizeResult(obj: any): ExtractionResult {
  const r = baseResult();
  if (!obj || typeof obj !== "object") return r;
  r.events = asArray<ExtractedEvent>(obj.events);
  r.parties = asArray<ExtractedParty>(obj.parties);
  r.payments = asArray<ExtractedPayment>(obj.payments);
  r.missingDocuments = asArray<MissingDocument>(obj.missingDocuments);
  if (obj.confidence != null) {
    const c = Number(obj.confidence);
    if (!Number.isNaN(c)) r.confidence = Math.max(0, Math.min(1, c));
  }
  r.generatedAt = new Date().toISOString();
  return r;
}

// Heuristic fallback parser for simple tabular sections in OCR text
function parseHeuristic(text: string): ExtractionResult {
  const res = baseResult();
  if (!text) return res;
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  function section(name: string) {
    const idx = lines.findIndex((l) => l.toLowerCase().startsWith(name.toLowerCase()));
    if (idx === -1) return [] as string[];
    const out: string[] = [];
    for (let i = idx + 1; i < lines.length; i++) {
      const ln = lines[i];
      if (/^[A-Z].+?:$/.test(ln)) break; // new header style
      if (/^(Identified Parties|Missing Documents|Payments|Events Log|End of report)/i.test(ln)) break; // known headers
      out.push(ln);
    }
    return out;
  }

  // Helpers to parse vertically stacked tables (header lines with value blocks)
  function parseVerticalTable(secLines: string[], headers: string[]) {
    const map: Record<string, string[]> = {};
    headers.forEach((h) => (map[h] = []));
    let current: string | null = null;
    const headerSet = new Set(headers.map((h) => h.toLowerCase()));
    for (const ln of secLines) {
      const low = ln.toLowerCase();
      if (headerSet.has(low)) {
        current = headers.find((h) => h.toLowerCase() === low) || null;
        continue;
      }
      if (current) {
        map[current].push(ln);
      }
    }
    return map;
  }

  // Missing Documents (row or vertical layout)
  {
    const miss = section("Missing Documents");
    // Try row-based first
    const missBody = miss.filter((l) => !/Document\s+Name/i.test(l));
    let parsed = 0;
    for (const row of missBody) {
      const cols = row.split(/\s{2,}|\t+/).filter(Boolean);
      if (cols.length >= 2) {
        const [doc, reason, date] = cols;
        res.missingDocuments!.push({ description: doc, reason, date } as any);
        parsed++;
      }
    }
    if (parsed === 0 && miss.length) {
      // Fallback to vertical layout
      const m = parseVerticalTable(miss, ["Document Name", "Reason Missing", "Requested On"]);
      const docs = m["Document Name"] || [];
      const reasons = m["Reason Missing"] || [];
      const dates = m["Requested On"] || [];
      const n = Math.max(docs.length, reasons.length, dates.length);
      for (let i = 0; i < n; i++) {
        const description = docs[i] || undefined;
        const reason = reasons[i] || undefined;
        const date = dates[i] || undefined;
        if (description || reason || date) {
          res.missingDocuments!.push({ description, reason, date } as any);
        }
      }
    }
  }

  // Identified Parties (row or vertical layout)
  {
    const party = section("Identified Parties");
    const partyBody = party.filter((l) => !/Party\s+Name/i.test(l));
    let parsed = 0;
    for (const row of partyBody) {
      const cols = row.split(/\s{2,}|\t+/).filter(Boolean);
      if (cols.length >= 2) {
        const [name, role] = cols;
        res.parties!.push({ name, role: (role || "other").toLowerCase() } as any);
        parsed++;
      }
    }
    if (parsed === 0 && party.length) {
      const m = parseVerticalTable(party, ["Party Name", "Role", "Contact"]);
      const names = m["Party Name"] || [];
      const roles = m["Role"] || [];
      const n = Math.max(names.length, roles.length);
      for (let i = 0; i < n; i++) {
        const name = names[i];
        const role = (roles[i] || "other").toLowerCase();
        if (name) res.parties!.push({ name, role } as any);
      }
    }
  }

  // Payments (row or vertical layout)
  {
    const pay = section("Payments");
    const payBody = pay.filter((l) => !/Payment\s+ID/i.test(l));
    const toPlainAmount = (s?: string) => {
      if (!s) return undefined as any;
      return s.replace(/[\p{Sc}■,'\s]/gu, "").trim();
    };
    let parsed = 0;
    for (const row of payBody) {
      const cols = row.split(/\s{2,}|\t+/).filter(Boolean);
      if (cols.length >= 2) {
        const [_pid, amount, _status, date] = cols;
        res.payments!.push({ amount: toPlainAmount(amount), currency: "INR", date } as any);
        parsed++;
      }
    }
    if (parsed === 0 && pay.length) {
      const m = parseVerticalTable(pay, ["Payment ID", "Amount", "Status", "Date"]);
      const ids = m["Payment ID"] || [];
      const amts = m["Amount"] || [];
      const stats = m["Status"] || [];
      const dates = m["Date"] || [];
      const n = Math.max(ids.length, amts.length, stats.length, dates.length);
      for (let i = 0; i < n; i++) {
        const amount = toPlainAmount(amts[i]);
        const date = dates[i];
        res.payments!.push({ amount, currency: "INR", date, status: stats[i] } as any);
      }
    }
  }

  // Events Log section (lines like: YYYY-MM-DD: description)
  {
    const evSec = section("Events Log");
    for (const ln of evSec) {
      const m = ln.match(/^(\d{4}-\d{2}-\d{2})\s*[:\-]\s*(.+)$/);
      if (m) {
        const [, date, desc] = m;
        // title: first clause up to period or 60 chars
        const t = desc.split(/\.|;|\||\-/)[0].trim().slice(0, 60);
        res.events!.push({ date, title: t || "Event", description: desc, confidence: 0.7 } as any);
      }
    }
  }

  return res;
}

export async function extractStructuredData(cleanedText: string): Promise<ExtractionResult> {
  try {
    if (!cleanedText || !cleanedText.trim()) {
      return baseResult();
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      log("GEMINI_API_KEY missing for aiExtractor");
      return baseResult();
    }

    const prompt = buildExtractionPrompt(cleanedText);
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidates = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash-001",
    ];
    let usedModel = candidates[0];
    let resp;
    let lastErr: any = null;
    for (const m of candidates) {
      try {
        usedModel = m;
        resp = await genAI.getGenerativeModel({ model: m }).generateContent([{ text: prompt }]);
        lastErr = null;
        break;
      } catch (e: any) {
        lastErr = e;
        continue;
      }
    }
    if (!resp) throw lastErr || new Error("No Gemini model responded");

    const text = stripCodeFences(resp?.response?.text?.() || "");
    const parsed = safeJSONParse(text);
    if (!parsed) {
      const snippet = text.slice(0, 2000);
      log("aiExtractor: JSON parse failed", snippet);
      logExtraction({
        timestamp: new Date().toISOString(),
        status: "failure",
        model: usedModel,
        validationErrors: ["JSON parse failed"],
      });
      try {
        const fs = await import("fs");
        const path = await import("path");
        const dir = path.join(process.cwd(), "logs");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `extraction-raw.txt`), snippet, { encoding: "utf8" });
      } catch {}
      return baseResult();
    }
    let normalized = normalizeResult(parsed);
    // If the LLM returned empty, try heuristic fallback on the cleaned text
    if (
      (!normalized.events || normalized.events.length === 0) &&
      (!normalized.parties || normalized.parties.length === 0) &&
      (!normalized.payments || normalized.payments.length === 0) &&
      (!normalized.missingDocuments || normalized.missingDocuments.length === 0)
    ) {
      const heuristic = parseHeuristic(cleanedText);
      // merge heuristic results
      normalized = {
        ...normalized,
        parties: heuristic.parties?.length ? heuristic.parties : normalized.parties,
        payments: heuristic.payments?.length ? heuristic.payments : normalized.payments,
        missingDocuments: heuristic.missingDocuments?.length ? heuristic.missingDocuments : normalized.missingDocuments,
      };
    }

    // If still no events, synthesize simple timeline events from payments/missing docs
    if (!normalized.events || normalized.events.length === 0) {
      const synthesized: ExtractedEvent[] = [] as any;
      const pays = normalized.payments || [];
      for (const pm of pays) {
        const title = `Payment ${pm.amount ? pm.amount : ''} ${pm.currency ? pm.currency : ''}`.trim();
        const descParts = [
          pm.payer ? `From: ${pm.payer}` : '',
          pm.payee ? `To: ${pm.payee}` : '',
          pm.reference ? `Ref: ${pm.reference}` : '',
          pm.description ? pm.description : '',
        ].filter(Boolean);
        synthesized.push({
          date: pm.date || undefined,
          title: title || 'Payment',
          description: descParts.join(' | ') || undefined,
          confidence: 0.6,
        } as any);
      }
      const miss = normalized.missingDocuments || [];
      for (const m of miss) {
        synthesized.push({
          date: (m as any).date || undefined,
          title: `Missing: ${m.description || (m as any).type || 'Document'}`,
          description: m.reason || undefined,
          confidence: 0.5,
        } as any);
      }
      if (synthesized.length) {
        normalized.events = synthesized;
      }
    }
    logExtraction({
      timestamp: new Date().toISOString(),
      status: "success",
      model: usedModel,
    });
    return normalized;
  } catch (err) {
    log("aiExtractor failure", err);
    logExtraction({
      timestamp: new Date().toISOString(),
      status: "failure",
      model: "gemini-1.5-flash-latest",
      error: String((err as Error)?.message || err),
    });
    return baseResult();
  }
}
