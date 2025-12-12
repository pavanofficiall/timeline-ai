// Builds a structured prompt for legal-grade event extraction

export function buildExtractionPrompt(text: string) {
  const instructions = `
You are a legal information extraction engine.
Task: Read the provided legal/administrative text and extract structured JSON ONLY.

Return strictly valid JSON with this shape:
{
  "events": [
    {
      "id": "optional",
      "date": "ISO 8601 or empty if unknown",
      "startDate": "ISO 8601 if a range start is present",
      "endDate": "ISO 8601 if a range end is present",
      "title": "concise event title",
      "description": "short narrative",
      "parties": ["party name or id"],
      "documentRefs": ["exhibit/file/annexure labels"],
      "payments": [
        {
          "amount": "string e.g. ₹1,20,000.00",
          "currency": "e.g. INR",
          "date": "ISO 8601 if present",
          "payer": "name or id",
          "payee": "name or id",
          "method": "if present",
          "reference": "txn/receipt no if present",
          "description": "optional",
          "confidence": 0.0
        }
      ],
      "location": "optional",
      "confidence": 0.0
    }
  ],
  "parties": [
    {
      "id": "optional",
      "name": "full canonical name",
      "role": "plaintiff|defendant|appellant|respondent|petitioner|complainant|accused|judge|witness|counsel|other",
      "identifier": "PAN/case-id/etc if present",
      "confidence": 0.0
    }
  ],
  "payments": [
    {
      "amount": "string",
      "currency": "string",
      "date": "ISO 8601",
      "payer": "string",
      "payee": "string",
      "method": "string",
      "reference": "string",
      "description": "string",
      "confidence": 0.0
    }
  ],
  "missingDocuments": [
    {
      "type": "e.g. affidavit/invoice/notice",
      "description": "string",
      "requestedBy": "name or role",
      "dueDate": "ISO 8601 if explicit",
      "relatedTo": "event id or title",
      "references": ["labels or filenames"],
      "confidence": 0.0
    }
  ],
  "sourceDocument": { "fileName": "optional", "fileType": "optional" },
  "generatedAt": "ISO 8601",
  "engine": "optional e.g. gemini-structured",
  "confidence": 0.0
}

Guidelines:
- Do not include any prose or explanation outside JSON.
- Infer ISO 8601 dates when clearly implied (YYYY-MM-DD). If date is ambiguous, leave empty.
- Events should be chronological when possible.
- Payments must be linked to events when context suggests.
- Parties must use canonical names as they appear.
- If no data for a section, return an empty array for that section.
`;

  return `${instructions}\n\nTEXT:\n${text}`.trim();
}

