import { NextRequest, NextResponse } from "next/server";
import { ensureSupabase } from "@/backend/lib/supabase";

export const runtime = "nodejs";

// GET /api/cases/:id -> basic case + counts
export async function GET(req: NextRequest, ctx: { params?: { id?: string } }) {
  try {
    const segments = req.nextUrl?.pathname.split("/").filter(Boolean) || [];
    const fallbackId = segments[segments.indexOf("cases") + 1];
    const id = ctx?.params?.id || fallbackId;
    if (!id) return NextResponse.json({ error: "Missing case id" }, { status: 400 });
    const supa: any = ensureSupabase();
    if (!supa) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    const [{ data: c }, { data: dc }, { data: ec }] = await Promise.all([
      supa.from("cases").select("*").eq("id", id).single(),
      supa.from("documents").select("id").eq("case_id", id),
      supa.from("case_events").select("id").eq("case_id", id),
    ]);
    return NextResponse.json({ case: c, docCount: dc?.length || 0, eventCount: ec?.length || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

