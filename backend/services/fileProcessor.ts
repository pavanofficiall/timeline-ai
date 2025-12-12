import { extractTextFromFile } from "../lib/ocr";
import { cleanText } from "../utils/cleanText";
import { log } from "../utils/logger";

export async function processDocument(fileBuffer: Buffer, fileName: string) {
  try {
    const fileType = detectFileType(fileName); // simple helper below

    const ocrResult = await extractTextFromFile(fileBuffer, fileType);

    const cleaned = cleanText(ocrResult.text);

    return {
      rawText: ocrResult.text,
      cleanedText: cleaned,
      pages: ocrResult.pages || [],
      engine: ocrResult.engine,
      fileType,
    };
  } catch (err) {
    log("Error in processDocument:", err);
    return {
      rawText: "",
      cleanedText: "",
      pages: [],
      engine: "none",
      fileType: "unknown",
    };
  }
}

function detectFileType(fileName: string): string {
  if (!fileName) return "unknown";
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["pdf"].includes(ext as string)) return "pdf";
  if (["jpg", "jpeg"].includes(ext as string)) return "jpg";
  if (["png"].includes(ext as string)) return "png";
  return "unknown";
}
