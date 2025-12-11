import { NextRequest, NextResponse } from "next/server";
import { ensureSupabase } from "@/backend/lib/supabase";

export const runtime = "nodejs";

// GET /api/cases/:id/docs
export async function GET(req: NextRequest, ctx: { params?: { id?: string } }) {
  try {
    const segments = req.nextUrl?.pathname.split("/").filter(Boolean) || [];
    const fallbackId = segments[segments.indexOf("cases") + 1];
    const id = ctx?.params?.id || fallbackId;
    if (!id) return NextResponse.json({ error: "Missing case id" }, { status: 400 });
    const supa: any = ensureSupabase();
    if (!supa) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    const { data, error } = await supa
      .from("documents")
      .select("id, filename, file_url, uploaded_at, status")
      .eq("case_id", id)
      .order("uploaded_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ documents: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

