import { NextRequest, NextResponse } from "next/server";
import { ensureSupabase } from "@/backend/lib/supabase";

function maskUrl(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return url.slice(0, 30) + "…";
  }
}

export async function GET(_req: NextRequest) {
  const supa: any = ensureSupabase();
  if (!supa) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }
  try {
    const url = process.env.SUPABASE_URL || null;
    const { data: buckets, error: listErr } = await supa.storage.listBuckets?.();
    const { data: docsBucket, error: getErr } = await supa.storage.getBucket?.("documents");
    return NextResponse.json({
      configured: true,
      url: maskUrl(url),
      buckets: buckets?.map((b: any) => b.id) || null,
      getBucket: docsBucket || null,
      errors: {
        listBuckets: listErr?.message || null,
        getBucket: getErr?.message || null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ configured: true, error: String(e?.message || e) }, { status: 200 });
  }
}

