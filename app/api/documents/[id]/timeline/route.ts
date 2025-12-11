import { NextRequest, NextResponse } from "next/server";
import { ensureSupabase } from "@/backend/lib/supabase";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params?: { id?: string } }) {
  try {
    // Be tolerant: accept id from path params, query string, or parse from pathname
    let documentId = ctx?.params?.id;
    if (!documentId) {
      try {
        const url = new URL(_req.url);
        documentId = url.searchParams.get("id") || undefined;
        if (!documentId) {
          const m = url.pathname.match(/\/api\/documents\/([^/]+)\/timeline/);
          if (m && m[1]) documentId = m[1];
        }
      } catch {}
    }
    if (!documentId) {
      return NextResponse.json({ error: "Missing document id" }, { status: 400 });
    }

    const sb: any = ensureSupabase() as any;
    if (!sb) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // Fetch events/parties/payments/missing and try to fetch document metadata
    const [evRes, paRes, payRes, missRes, docById, docByLegacy] = await Promise.all([
      sb.from("case_events").select("*").eq("document_id", documentId),
      sb.from("case_parties").select("*").eq("document_id", documentId),
      sb.from("case_payments").select("*").eq("document_id", documentId),
      sb.from("missing_documents").select("*").eq("document_id", documentId),
      sb.from("documents").select("*").eq("id", documentId).maybeSingle?.() ?? sb.from("documents").select("*").eq("id", documentId).single(),
      sb.from("documents").select("*").eq("document_id", documentId).maybeSingle?.() ?? sb.from("documents").select("*").eq("document_id", documentId).single(),
    ]);

    if (evRes.error || paRes.error || payRes.error || missRes.error) {
      return NextResponse.json(
        {
          error: "Database query failed",
          details: {
            events: evRes.error?.message,
            parties: paRes.error?.message,
            payments: payRes.error?.message,
            missing: missRes.error?.message,
          },
        },
        { status: 500 }
      );
    }

    const events = (evRes.data || []).slice().sort((a: any, b: any) => {
      const da = a?.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY;
      const db = b?.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY;
      return da - db;
    });

    const docMeta = (docById as any)?.data || (docByLegacy as any)?.data || null;
    return NextResponse.json({
      document: docMeta,
      timeline: events,
      parties: paRes.data || [],
      payments: payRes.data || [],
      missing: missRes.data || [],
    });
  } catch (_err) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
