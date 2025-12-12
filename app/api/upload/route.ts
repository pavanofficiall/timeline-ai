import { NextRequest, NextResponse } from "next/server";
import { uploadDocumentRoute } from "@/backend/routes/upload";
import { ensureSupabase } from "@/backend/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field 'file'" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Adapter: simulate minimal Express req/res for backend handler reuse
    const mockReq: any = {
      file: { buffer, originalname: file.name, mimetype: (file as any).type || "application/octet-stream" },
    };

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

    await uploadDocumentRoute(mockReq, holder);

    // If backend handler returned an error, forward it with same status
    if ((holder._status && holder._status >= 400) || (holder._json && holder._json.error)) {
      return NextResponse.json(holder._json || { error: "Upload failed" }, { status: holder._status || 500 });
    }

    const stored = holder._json?.document || null;
    if (!stored) {
      return NextResponse.json({ error: "Upload failed: empty response" }, { status: 500 });
    }

    // The bucket is private; generate a short-lived signed URL
    const supa = ensureSupabase();
    let fileUrl: string | null = null;
    if (supa) {
      const pth = stored.file_url || stored.file_path || stored.path || "";
      try {
        const { data, error } = await (supa as any).storage.from("documents").createSignedUrl(pth, 60 * 10); // 10 minutes
        if (!error) fileUrl = data?.signedUrl || null;
      } catch {}
    }
    const documentId = stored.document_id || stored.id || null;

    return NextResponse.json(
      { success: true, documentId, fileUrl, document: stored },
      { status: holder._status || 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
