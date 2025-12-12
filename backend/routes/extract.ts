import { supabase } from "../lib/supabase";
import { extractStructuredData } from "../services/aiExtractor";
import { log } from "../utils/logger";

// Express-style handler: POST /api/extract { document_id }
export async function extractDocumentRoute(req: any, res: any) {
  try {
    const documentId = req.body?.document_id || req.query?.document_id;
    if (!documentId) {
      return res.status(400).json({ error: "Missing document_id" });
    }

    // 1) Fetch cleaned_text from DB
    const { data: doc, error: docErr } = await (supabase as any)
      .from("documents")
      .select("document_id, cleaned_text, file_name, file_type")
      .eq("document_id", documentId)
      .single();

    if (docErr || !doc) {
      log("extract: document not found or fetch error", docErr || documentId);
      return res.status(404).json({ error: "Document not found" });
    }

    const cleanedText = doc.cleaned_text || "";

    // 2) Call AI extractor
    const result = await extractStructuredData(cleanedText);

    // 3) Persist into tables (best-effort; stop on first error)
    // case_events
    const eventRows = (result.events || []).map((e) => ({
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

    if (eventRows.length) {
      const { error: evErr } = await (supabase as any)
        .from("case_events")
        .insert(eventRows);
      if (evErr) {
        log("extract: insert case_events failed", evErr);
        return res.status(500).json({ error: "Failed to store events" });
      }
    }

    // case_parties
    const partyRows = (result.parties || []).map((p) => ({
      document_id: documentId,
      name: p.name || null,
      role: p.role || null,
      identifier: p.identifier || null,
      confidence: typeof p.confidence === "number" ? p.confidence : null,
      created_at: new Date().toISOString(),
    }));
    if (partyRows.length) {
      const { error: paErr } = await (supabase as any)
        .from("case_parties")
        .insert(partyRows);
      if (paErr) {
        log("extract: insert case_parties failed", paErr);
        return res.status(500).json({ error: "Failed to store parties" });
      }
    }

    // case_payments
    const paymentRows = (result.payments || []).map((pm) => ({
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
    if (paymentRows.length) {
      const { error: payErr } = await (supabase as any)
        .from("case_payments")
        .insert(paymentRows);
      if (payErr) {
        log("extract: insert case_payments failed", payErr);
        return res.status(500).json({ error: "Failed to store payments" });
      }
    }

    // missing_documents
    const missingRows = (result.missingDocuments || []).map((m) => ({
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
    if (missingRows.length) {
      const { error: mdErr } = await (supabase as any)
        .from("missing_documents")
        .insert(missingRows);
      if (mdErr) {
        log("extract: insert missing_documents failed", mdErr);
        return res.status(500).json({ error: "Failed to store missing documents" });
      }
    }

    return res.json({ success: true, result });
  } catch (e) {
    log("extract: unexpected error", e);
    return res.status(500).json({ error: "Unexpected error" });
  }
}

