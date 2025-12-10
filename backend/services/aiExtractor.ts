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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const resp = await model.generateContent([{ text: prompt }]);

    const text = stripCodeFences(resp?.response?.text?.() || "");
    const parsed = safeJSONParse(text);
    if (!parsed) {
      const snippet = text.slice(0, 2000);
      log("aiExtractor: JSON parse failed", snippet);
      logExtraction({
        timestamp: new Date().toISOString(),
        status: "failure",
        model: "gemini-1.5-flash",
        validationErrors: ["JSON parse failed"],
      });
      return baseResult();
    }
    const normalized = normalizeResult(parsed);
    logExtraction({
      timestamp: new Date().toISOString(),
      status: "success",
      model: "gemini-1.5-flash",
    });
    return normalized;
  } catch (err) {
    log("aiExtractor failure", err);
    logExtraction({
      timestamp: new Date().toISOString(),
      status: "failure",
      model: "gemini-1.5-flash",
      error: String((err as Error)?.message || err),
    });
    return baseResult();
  }
}
