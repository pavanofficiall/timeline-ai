import { NextRequest, NextResponse } from "next/server";
import { extractDocumentRoute } from "@/backend/routes/extract";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const documentId: string | undefined = body?.documentId || body?.document_id;
    if (!documentId) {
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    }

    const mockReq: any = { body: { document_id: documentId }, query: { document_id: documentId } };
    const holder: any = {
      _status: 200,
      _json: null as any,
      status(code: number) {
        this._status = code;
        return this;
      },
      json(obj: any) {
        this._json = obj;
        return this;
      },
    };

    const TIMEOUT_MS = 59000; // within Vercel/Next.js timeout window

    const runner = (async () => {
      await extractDocumentRoute(mockReq, holder);
      return { ok: true } as const;
    })();

    const timeout = new Promise<{ timeout: true }>((resolve) =>
      setTimeout(() => resolve({ timeout: true }), TIMEOUT_MS)
    );

    const race = await Promise.race<[typeof runner extends Promise<infer T> ? T : never, any]>([
      runner as any,
      timeout as any,
    ] as any);

    if ((race as any)?.timeout) {
      // Best-effort: started processing, returning 202
      return NextResponse.json({ status: "processing", documentId }, { status: 202 });
    }

    const payload = holder._json || {};
    // Expecting shape: { success: true, result } from the backend route
    return NextResponse.json(payload, { status: holder._status || 200 });
  } catch (err) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
