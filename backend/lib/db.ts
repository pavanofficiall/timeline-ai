import { ensureSupabase } from "./supabase";
import type { ExtractedEvent, ExtractedParty, ExtractedPayment, MissingDocument } from "../types/extraction";

export async function insertCaseEvents(documentId: string, events: ExtractedEvent[]) {
  const supabase = ensureSupabase();
  if (!supabase || !events?.length) return { data: [], error: null } as any;
  const rows = events.map((e) => ({
    document_id: documentId,
    date: e.date || null,
    title: e.title || null,
    description: e.description || null,
    confidence_score: typeof e.confidence === "number" ? e.confidence : null,
    created_at: new Date().toISOString(),
  }));
  return await (supabase as any).from("case_events").insert(rows).select();
}

export async function insertCaseParties(documentId: string, parties: ExtractedParty[]) {
  const supabase = ensureSupabase();
  if (!supabase || !parties?.length) return { data: [], error: null } as any;
  const rows = parties.map((p) => ({
    document_id: documentId,
    name: p.name || null,
    role: p.role || null,
    created_at: new Date().toISOString(),
  }));
  return await (supabase as any).from("case_parties").insert(rows).select();
}

export async function insertCasePayments(documentId: string, payments: ExtractedPayment[]) {
  const supabase = ensureSupabase();
  if (!supabase || !payments?.length) return { data: [], error: null } as any;
  const toNumber = (val?: string | number | null) => {
    if (val == null) return null;
    const s = String(val).replace(/[,\s₹]/g, "");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
  };
  const rows = payments.map((pm) => ({
    document_id: documentId,
    amount: toNumber(pm.amount),
    currency: pm.currency || null,
    payer: pm.payer || null,
    payee: pm.payee || null,
    date: pm.date || null,
    created_at: new Date().toISOString(),
  }));
  return await (supabase as any).from("case_payments").insert(rows).select();
}

export async function insertMissingDocuments(documentId: string, docs: MissingDocument[]) {
  const supabase = ensureSupabase();
  if (!supabase || !docs?.length) return { data: [], error: null } as any;
  const rows = docs.map((m) => ({
    document_id: documentId,
    description: m.description || m.type || null,
    reason: m.reason || m.requestedBy || null,
    created_at: new Date().toISOString(),
  }));
  return await (supabase as any).from("missing_documents").insert(rows).select();
}
