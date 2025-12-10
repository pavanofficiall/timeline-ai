import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "timeline-ai", "logs");
const LOG_FILE = path.join(LOG_DIR, "extraction.log");

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch {}
}

export type ExtractionLog = {
  timestamp: string;
  status: "success" | "failure";
  model?: string;
  tokens?: { input?: number; output?: number };
  error?: string;
  validationErrors?: string[];
  documentId?: string;
};

export function logExtraction(entry: ExtractionLog) {
  try {
    ensureLogDir();
    const line = JSON.stringify(entry) + "\n";
    fs.appendFileSync(LOG_FILE, line, { encoding: "utf8" });
  } catch {
    // best effort only
  }
}

