import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "../utils/logger";

type Engine = "gemini" | "ocrspace" | "none";

export type OcrResult = {
  text: string;
  pages: string[];
  engine: Engine;
};

function bufferToBase64(buf: Uint8Array | Buffer): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b.toString("base64");
}

function mimeFromFileType(fileType: string): string {
  const ft = (fileType || "").toLowerCase();
  if (ft.includes("pdf")) return "application/pdf";
  if (ft.includes("png")) return "image/png";
  if (ft.includes("jpg") || ft.includes("jpeg")) return "image/jpeg";
  if (ft.includes("webp")) return "image/webp";
  if (ft.includes("tiff") || ft.includes("tif")) return "image/tiff";
  return "application/octet-stream";
}

async function geminiOcr(fileBuffer: Uint8Array | Buffer, fileType: string): Promise<OcrResult> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing");
  }

  const base64 = bufferToBase64(fileBuffer);
  const mimeType = mimeFromFileType(fileType);
  const genAI = new GoogleGenerativeAI(apiKey);
  const candidates = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
  ];
  let model = genAI.getGenerativeModel({ model: candidates[0] });

  const prompt =
    "You are an OCR and document extraction engine.\n" +
    "Extract ALL visible text from the uploaded document.\n" +
    "Return ONLY raw text, no explanation.";

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { data: base64, mimeType } },
  ]);

  const text = (result?.response?.text?.() || "").trim();
  const pages = text ? text.split("\f") : [];

  return {
    text,
    pages: pages.length ? pages : text ? [text] : [],
    engine: "gemini",
  };
}

async function ocrSpaceFallback(fileBuffer: Uint8Array | Buffer, fileType: string): Promise<OcrResult> {
  const apiKey = process.env.OCR_API_KEY || "";
  if (!apiKey) throw new Error("OCR_API_KEY missing");

  const base64 = bufferToBase64(fileBuffer);
  const mimeType = mimeFromFileType(fileType);

  const body = new URLSearchParams();
  body.set("apikey", apiKey);
  body.set("base64Image", `data:${mimeType};base64,${base64}`);

  const resp = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!resp.ok) {
    throw new Error(`OCR.Space HTTP ${resp.status}`);
  }
  const json: any = await resp.json();
  const parsed = json?.ParsedResults?.[0]?.ParsedText || "";
  const text = String(parsed).trim();

  return {
    text,
    pages: text ? [text] : [],
    engine: "ocrspace",
  };
}

// Primary: Gemini Vision, Fallback: OCR.Space
export async function extractTextFromFile(
  fileBuffer: Uint8Array | Buffer,
  fileType: string
): Promise<OcrResult> {
  try {
    const gem = await geminiOcr(fileBuffer, fileType);
    if (gem.text) return gem;
    log("Gemini OCR returned empty text; falling back to OCR.Space");
  } catch (err) {
    log("Gemini OCR failed; falling back to OCR.Space", err);
  }

  try {
    const oc = await ocrSpaceFallback(fileBuffer, fileType);
    if (oc.text) return oc;
  } catch (err) {
    log("OCR.Space fallback failed", err);
  }

  return { text: "", pages: [], engine: "none" };
}

// Backwards-compat placeholder for any older references
export async function runOCR(fileBuffer: Uint8Array | Buffer, fileType = "application/octet-stream") {
  const res = await extractTextFromFile(fileBuffer, fileType);
  return res.text;
}
