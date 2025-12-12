// Extraction schema interfaces for legal document processing

export interface ExtractedParty {
  id?: string;
  name: string;
  role:
    | "plaintiff"
    | "defendant"
    | "appellant"
    | "respondent"
    | "petitioner"
    | "complainant"
    | "accused"
    | "judge"
    | "witness"
    | "counsel"
    | "other";
  identifier?: string; // e.g., PAN, case-specific ID
  confidence?: number; // 0.0 - 1.0
}

export interface ExtractedPayment {
  amount?: string; // keep as string to preserve formatting (₹, decimals)
  currency?: string; // e.g., INR, USD
  date?: string; // ISO 8601
  payer?: string; // party name or id
  payee?: string; // party name or id
  method?: string; // e.g., bank transfer, cash, cheque
  reference?: string; // receipt no., txn id
  description?: string;
  confidence?: number; // 0.0 - 1.0
}

export interface MissingDocument {
  type: string; // e.g., affidavit, invoice, notice, annexure
  description?: string;
  requestedBy?: string; // name or role
  dueDate?: string; // ISO 8601 if explicitly stated
  relatedTo?: string; // event id or title
  references?: string[]; // filenames, exhibit numbers, docket ids
  confidence?: number; // 0.0 - 1.0
}

export interface ExtractedEvent {
  id?: string;
  date?: string; // ISO 8601 (single date)
  startDate?: string; // ISO 8601 (if range provided)
  endDate?: string; // ISO 8601 (if range provided)
  title: string; // concise event title
  description?: string; // brief narrative
  parties?: string[]; // party names or ids involved
  documentRefs?: string[]; // file names, exhibit labels, links
  payments?: ExtractedPayment[]; // zero or more payments linked to event
  location?: string;
  confidence?: number; // 0.0 - 1.0
}

export interface ExtractionResult {
  events: ExtractedEvent[];
  parties?: ExtractedParty[];
  payments?: ExtractedPayment[];
  missingDocuments?: MissingDocument[];
  sourceDocument?: {
    fileName?: string;
    fileType?: string;
  };
  generatedAt: string; // ISO 8601
  engine?: string; // e.g., gemini, ocrspace, gemini-structured
  confidence?: number; // overall confidence (0.0 - 1.0)
}

