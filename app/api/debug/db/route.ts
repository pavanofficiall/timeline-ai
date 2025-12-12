import { NextRequest, NextResponse } from "next/server";
import { ensureSupabase } from "@/backend/lib/supabase";

export async function GET(_req: NextRequest) {
  const supa: any = ensureSupabase();
  if (!supa) return NextResponse.json({ configured: false }, { status: 200 });
  try {
    const probe = await supa.from("documents").select("id, filename, status, uploaded_at").limit(1);
    return NextResponse.json({ configured: true, probe }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ configured: true, error: String(e?.message || e) }, { status: 200 });
  }
}

