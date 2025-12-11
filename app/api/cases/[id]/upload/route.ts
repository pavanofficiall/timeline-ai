import { NextRequest, NextResponse } from "next/server";
import { ensureSupabase } from "@/backend/lib/supabase";
import { ensureBucket } from "@/backend/lib/storage";
import { processDocument } from "@/backend/services/fileProcessor";
import { extractStructuredData } from "@/backend/services/aiExtractor";

export const runtime = "nodejs";

// POST /api/cases/:id/upload (multipart form-data with file)
export async function POST(req: NextRequest, ctx: { params?: { id?: string } }) {
  try {
    const caseId = ctx?.params?.id;
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

    // Extract events
    const result = await extractStructuredData(processed.cleanedText || "");

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
    // Deduplicate by (case_id, date, description)
    const unique = new Map<string, any>();
    for (const r of eventRows) {
      const k = `${r.case_id}|${r.date || ''}|${(r.description || '').toLowerCase()}`;
      if (!unique.has(k)) unique.set(k, r);
    }
    const { data: inserted, error: evErr } = await supa.from("case_events").insert([...unique.values()]).select();
    if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 });

    // Mark document processed
    await supa.from("documents").update({ status: "processed" }).eq("id", docRow.id);

    return NextResponse.json({
      success: true,
      document: docRow,
      added: inserted?.length || 0,
      duplicatesIgnored: eventRows.length - (inserted?.length || 0),
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

