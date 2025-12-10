import { supabase } from "./supabase";
import type { ExtractedEvent, ExtractedParty, ExtractedPayment, MissingDocument } from "../types/extraction";

export async function insertCaseEvents(documentId: string, events: ExtractedEvent[]) {
  if (!events?.length) return { data: [], error: null };
  const rows = events.map((e) => ({
    document_id: documentId,
    date: e.date || null,
    start_date: e.startDate || null,
    end_date: e.endDate || null,
    title: e.title || null,
    description: e.description || null,
    parties: e.parties || [],
    document_refs: e.documentRefs || [],
    payments: e.payments || [],
    location: e.location || null,
    confidence: typeof e.confidence === "number" ? e.confidence : null,
    created_at: new Date().toISOString(),
  }));
  return await (supabase as any).from("case_events").insert(rows).select();
}

export async function insertCaseParties(documentId: string, parties: ExtractedParty[]) {
  if (!parties?.length) return { data: [], error: null };
  const rows = parties.map((p) => ({
    document_id: documentId,
    name: p.name || null,
    role: p.role || null,
    identifier: p.identifier || null,
    confidence: typeof p.confidence === "number" ? p.confidence : null,
    created_at: new Date().toISOString(),
  }));
  return await (supabase as any).from("case_parties").insert(rows).select();
}

export async function insertCasePayments(documentId: string, payments: ExtractedPayment[]) {
  if (!payments?.length) return { data: [], error: null };
  const rows = payments.map((pm) => ({
    document_id: documentId,
    amount: pm.amount || null,
    currency: pm.currency || null,
    date: pm.date || null,
    payer: pm.payer || null,
    payee: pm.payee || null,
    method: pm.method || null,
    reference: pm.reference || null,
    description: pm.description || null,
    confidence: typeof pm.confidence === "number" ? pm.confidence : null,
    created_at: new Date().toISOString(),
  }));
  return await (supabase as any).from("case_payments").insert(rows).select();
}

export async function insertMissingDocuments(documentId: string, docs: MissingDocument[]) {
  if (!docs?.length) return { data: [], error: null };
  const rows = docs.map((m) => ({
    document_id: documentId,
    type: m.type || null,
    description: m.description || null,
    requested_by: m.requestedBy || null,
    due_date: m.dueDate || null,
    related_to: m.relatedTo || null,
    references: m.references || [],
    confidence: typeof m.confidence === "number" ? m.confidence : null,
    created_at: new Date().toISOString(),
  }));
  return await (supabase as any).from("missing_documents").insert(rows).select();
}

