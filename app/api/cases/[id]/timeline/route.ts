import { NextRequest, NextResponse } from "next/server";
import { ensureSupabase } from "@/backend/lib/supabase";

export const runtime = "nodejs";

// GET /api/cases/:id/timeline
// Returns merged, chronologically-sorted, deduplicated timeline for the case
export async function GET(req: NextRequest, ctx: { params?: { id?: string } }) {
  try {
    const segments = req.nextUrl?.pathname.split("/").filter(Boolean) || [];
    const fallbackId = segments[segments.indexOf("cases") + 1];
    const id = ctx?.params?.id || fallbackId;
    if (!id) return NextResponse.json({ error: "Missing case id" }, { status: 400 });
    const supa: any = ensureSupabase();
    if (!supa) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

    const { data: events, error } = await supa
      .from("case_events")
      .select("id, case_id, document_id, date, title, description, confidence_score")
      .eq("case_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Sort and deduplicate (date + description)
    const list = (events || []).slice().sort((a: any, b: any) => {
      const da = a?.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY;
      const db = b?.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY;
      return da - db;
    });
    const dedup = new Map<string, any>();
    for (const e of list) {
      const key = `${e.date || ''}|${(e.description || '').toLowerCase()}`;
      if (!dedup.has(key)) dedup.set(key, e);
    }

    return NextResponse.json({ timeline: [...dedup.values()] });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

