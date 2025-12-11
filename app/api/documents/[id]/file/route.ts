import { NextRequest, NextResponse } from "next/server";
import { ensureSupabase } from "@/backend/lib/supabase";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const docId = ctx?.params?.id;
  const supa: any = ensureSupabase();
  if (!docId || !supa) return NextResponse.json({ error: "Missing" }, { status: 400 });

  // Try new schema first
  let path: string | null = null;
  try {
    const { data: d1 } = await supa.from("documents").select("file_url").eq("id", docId).maybeSingle?.() ?? await supa.from("documents").select("file_url").eq("id", docId).single();
    path = d1?.file_url || null;
  } catch {}
  if (!path) {
    const { data: d2 } = await supa.from("documents").select("file_path").eq("document_id", docId).maybeSingle?.() ?? await supa.from("documents").select("file_path").eq("document_id", docId).single();
    path = d2?.file_path || null;
  }
  if (!path) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supa.storage.from("documents").createSignedUrl(path, 60 * 5);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.redirect(data.signedUrl, 302);
}

