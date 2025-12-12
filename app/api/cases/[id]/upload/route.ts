import { NextRequest, NextResponse } from "next/server";
import { ensureSupabase } from "@/backend/lib/supabase";
import { ensureBucket } from "@/backend/lib/storage";
import { processDocument } from "@/backend/services/fileProcessor";
import { extractStructuredData } from "@/backend/services/aiExtractor";
import { log as serverLog } from "@/backend/utils/logger";

export const runtime = "nodejs";

// POST /api/cases/:id/upload (multipart form-data with file)
export async function POST(req: NextRequest, ctx: { params?: { id?: string } }) {
  try {
    const segments = req.nextUrl?.pathname.split("/").filter(Boolean) || [];
    const fallbackId = segments[segments.indexOf("cases") + 1];
    const caseId = ctx?.params?.id || fallbackId;
    if (!caseId) return NextResponse.json({ error: "Missing case id" }, { status: 400 });
    const supa: any = ensureSupabase();
    if (!supa) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field 'file'" }, { status: 400 });
    }

    // Ensure bucket
    const ensured = await ensureBucket(supa, "documents", false);
    if (!(ensured as any).ok) return NextResponse.json({ error: "Bucket missing" }, { status: 500 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to storage
    const path = `${Date.now()}-${file.name}`;
    const { error: upErr } = await supa.storage.from("documents").upload(path, buffer, {
      contentType: (file as any).type || "application/octet-stream",
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    // Insert document row (new schema)
    const { data: docRow, error: insErr } = await supa
      .from("documents")
      .insert({ filename: file.name, file_url: path, status: "pending", case_id: caseId })
      .select()
      .single();
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    // OCR + clean
    const processed = await processDocument(buffer, file.name);
    // Write a short OCR preview log (first 2000 chars) for debugging
    try {
      const fs = await import("fs");
      const pathMod = await import("path");
      const dir = pathMod.join(process.cwd(), "logs");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const ocrPreview = String(processed?.rawText || "").slice(0, 2000);
      fs.writeFileSync(pathMod.join(dir, `ocr-${docRow.id}.txt`), ocrPreview, { encoding: "utf8" });
    } catch {
      // non-blocking
    }

    // Extract events
    let result = await extractStructuredData(processed.cleanedText || "");

    // Belt-and-suspenders: if no events but we do have payments/missing, synthesize simple events here as well
    if ((!result.events || result.events.length === 0) && (result.payments?.length || result.missingDocuments?.length)) {
      const synth: any[] = [];
      for (const pm of result.payments || []) {
        synth.push({
          date: (pm as any).date || null,
          title: `Payment ${pm.amount ?? ''} ${pm.currency ?? ''}`.trim() || 'Payment',
          description: [pm.payer ? `From: ${pm.payer}` : '', pm.payee ? `To: ${pm.payee}` : ''].filter(Boolean).join(' | ') || null,
          confidence: 0.5,
        });
      }
      for (const m of result.missingDocuments || []) {
        synth.push({
          date: (m as any).date || null,
          title: `Missing: ${m.description || (m as any).type || 'Document'}`,
          description: (m as any).reason || null,
          confidence: 0.4,
        });
      }
      if (synth.length) {
        result = { ...result, events: synth } as any;
      }
    }

    // Persist into case timeline (events table with case_id + doc linkage)
    const eventRows = (result.events || [])
      .filter((e) => e?.date || e?.title)
      .map((e) => ({
        case_id: caseId,
        document_id: docRow.id,
        date: e.date || null,
        title: e.title || "Event",
        description: e.description || null,
        confidence_score: typeof e.confidence === "number" ? e.confidence : null,
        created_at: new Date().toISOString(),
      }));
    // Deduplicate by (case_id, date, title, description) within this batch
    const unique = new Map<string, any>();
    for (const r of eventRows) {
      const k = `${r.case_id}|${r.date || ''}|${(r.title || '').toLowerCase()}|${(r.description || '').toLowerCase()}`;
      if (!unique.has(k)) unique.set(k, r);
    }
    const toInsert = [...unique.values()];
    const { data: inserted, error: evErr } = await supa.from("case_events").insert(toInsert).select();
    if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 });

    // Mark document processed
    await supa.from("documents").update({ status: "processed" }).eq("id", docRow.id);

    const added = inserted?.length || 0;
    const ignored = (eventRows.length || 0) - added;
    // Light server-side log
    try { serverLog("case-upload summary", { caseId, docId: docRow.id, added, ignored }); } catch {}

    return NextResponse.json({
      success: true,
      document: docRow,
      added,
      duplicatesIgnored: ignored,
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
