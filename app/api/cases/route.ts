import { NextRequest, NextResponse } from "next/server";
import { ensureSupabase } from "@/backend/lib/supabase";

export const runtime = "nodejs";

// GET /api/cases -> list cases
export async function GET() {
  try {
    const supa: any = ensureSupabase();
    if (!supa) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    const { data, error } = await supa
      .from("cases")
      .select("id, title, lawyer_id, created_at")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ cases: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

// POST /api/cases { title, lawyer_id? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = String(body?.title || "").trim();
    const lawyer_id = body?.lawyer_id ? String(body.lawyer_id) : null;
    if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

    const supa: any = ensureSupabase();
    if (!supa) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    const { data, error } = await supa.from("cases").insert({ title, lawyer_id }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, case: data });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
