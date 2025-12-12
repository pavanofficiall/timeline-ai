import { NextRequest, NextResponse } from "next/server";
import { ensureSupabase } from "@/backend/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params?: { id?: string } }) {
  // Tolerant id parsing (path params, query string, or from pathname)
  let docId = ctx?.params?.id;
  try {
    const url = new URL(req.url);
    if (!docId) docId = url.searchParams.get("id") || url.searchParams.get("doc") || url.searchParams.get("document_id") || undefined;
    if (!docId) {
      const m = url.pathname.match(/\/api\/documents\/([^/]+)\/file/);
      if (m && m[1]) docId = m[1];
    }
  } catch {}

  const supa: any = ensureSupabase();
  if (!supa) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  if (!docId) return NextResponse.json({ error: "Missing document id" }, { status: 400 });

  // Fetch document metadata (support both new 'id' pk and legacy 'document_id')
  let path: string | null = null;
  let fileUrl: string | null = null;
  try {
    const q1 = await (supa.from("documents").select("file_url, file_path").eq("id", docId).maybeSingle?.() ?? supa.from("documents").select("file_url, file_path").eq("id", docId).single());
    fileUrl = q1?.data?.file_url || null;
    path = q1?.data?.file_path || null;
  } catch {}
  if (!fileUrl && !path) {
    try {
      const q2 = await (supa.from("documents").select("file_url, file_path").eq("document_id", docId).maybeSingle?.() ?? supa.from("documents").select("file_url, file_path").eq("document_id", docId).single());
      fileUrl = q2?.data?.file_url || null;
      path = path || q2?.data?.file_path || null;
    } catch {}
  }
  // Prefer fileUrl; if it's a full URL, redirect directly
  const chosen = fileUrl || path;
  if (!chosen) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (/^https?:\/\//i.test(chosen)) {
    return NextResponse.redirect(chosen, 302);
  }

  // Normalize storage path (strip common prefixes)
  let storagePath = chosen.replace(/^\//, "");
  storagePath = storagePath.replace(/^documents\//, "");

  const { data, error } = await supa.storage.from("documents").createSignedUrl(storagePath, 60 * 5);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.redirect(data.signedUrl, 302);
}
