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
      if (/^(Identified Parties|Missing Documents|Payments)/i.test(ln)) break; // known headers
      out.push(ln);
    }
    return out;
  }

  // Missing Documents
  const miss = section("Missing Documents");
  // skip header line if present
  const missBody = miss.filter((l) => !/Document\s+Name/i.test(l));
  for (const row of missBody) {
    const cols = row.split(/\s{2,}|\t+/).filter(Boolean);
    if (cols.length >= 2) {
      const [doc, reason, date] = cols;
      res.missingDocuments!.push({ type: "missing", description: doc, payment: undefined as any, parties: undefined as any, reason, date } as any);
      // normalize to schema fields we persist later (description/reason)
    }
  }

  // Identified Parties
  const party = section("Identified Parties");
  const partyBody = party.filter((l) => !/Party\s+Name/i.test(l));
  for (const row of partyBody) {
    const cols = row.split(/\s{2,}|\t+/).filter(Boolean);
    if (cols.length >= 2) {
      const [name, role] = cols;
      res.parties!.push({ name, role: (role || "other").toLowerCase() } as any);
    }
  }

  // Payments
  const pay = section("Payments");
  const payBody = pay.filter((l) => !/Payment\s+ID/i.test(l));
  const toNumber = (s?: string) => {
    if (!s) return undefined;
    const cleaned = s.replace(/[\p{Sc}■,]/gu, "").trim();
    const n = parseFloat(cleaned);
    return isFinite(n) ? String(n) : undefined;
  };
  for (const row of payBody) {
    const cols = row.split(/\s{2,}|\t+/).filter(Boolean);
    if (cols.length >= 2) {
      const [pid, amount, status, date] = cols;
      res.payments!.push({ amount: toNumber(amount), currency: undefined, date } as any);
      // We could also add an event per payment if needed
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
