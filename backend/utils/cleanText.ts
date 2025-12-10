// Clean extracted text for better AI processing
export function cleanText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

