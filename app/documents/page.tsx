import Link from "next/link";
import { ensureSupabase } from "@/backend/lib/supabase";
import RetryExtractionButton from "@/components/RetryExtractionButton";

type LegacyDoc = {
  document_id: string;
  file_name?: string;
  file_path?: string;
  created_at?: string;
  engine?: string;
};

type NewDoc = {
  id: string;
  filename?: string;
  file_url?: string;
  uploaded_at?: string;
  status?: string;
};

async function fetchDocuments(supa: any) {

  // Try new schema first
  const { data: newer, error: errNew } = await (supa as any)
    .from("documents")
    .select("id, filename, file_url, uploaded_at, status")
    .order("uploaded_at", { ascending: false })
    .limit(50);

  if (!errNew && newer?.length) {
    const docs = (newer as NewDoc[]).map((d) => ({
      id: d.id,
      filename: d.filename || "Document",
      fileUrl: d.file_url || null,
      uploadedAt: d.uploaded_at || null,
      status: d.status || "pending",
    }));
    return docs;
  }

  // Fallback to legacy schema
  const { data: legacy, error: errLegacy } = await (supa as any)
    .from("documents")
    .select("document_id, file_name, file_path, created_at, engine")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!errLegacy && legacy?.length) {
    const docs = (legacy as LegacyDoc[]).map((d) => ({
      id: d.document_id,
      filename: d.file_name || "Document",
      fileUrl: d.file_path ? ((supa as any).storage.from("documents").getPublicUrl(d.file_path).data?.publicUrl || null) : null,
      uploadedAt: d.created_at || null,
      status: d.engine || "processed",
    }));
    return docs;
  }

  return [] as { id: string; filename: string; fileUrl: string | null; uploadedAt: string | null; status: string }[];
}

export default async function DocumentsPage() {
  const supa = ensureSupabase();
  const notConfigured = !supa;
  const documents = supa ? await fetchDocuments(supa) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Documents</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Home</Link>
        </div>

        {notConfigured ? (
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_KEY to <code className="px-1 py-0.5 rounded bg-muted">.env.local</code> and restart the dev server.
          </div>
        ) : null}

        {documents.length === 0 ? (
          <div className="text-sm text-muted-foreground">No documents found.</div>
        ) : (
          <ul className="divide-y border rounded-lg bg-card">
            {documents.map((d) => (
              <li key={d.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{d.filename}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : "Unknown time"}
                    {" • Status: "}{d.status?.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/api/documents/${d.id}/file`} className="text-sm text-blue-600 hover:underline">
                    View File
                  </Link>
                  <Link href={`/timeline/${d.id}`} className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded">
                    Open Timeline
                  </Link>
                  <RetryExtractionButton documentId={d.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
