"use client";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      let json: any = null;
      try {
        json = await res.json();
      } catch (_) {
        // ignore body parse failures
      }
      if (!res.ok) {
        const msg = json?.error || `Upload failed (${res.status})`;
        const details = json?.details ? `: ${json.details}` : "";
        throw new Error(`${msg}${details}`);
      }
      setResult(json || { success: true });
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Upload Document</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
          <button
            type="submit"
            disabled={!file || loading}
            className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Uploading…" : "Upload"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {result && (
          <div className="mt-4 text-sm">
            <div className="font-medium">Upload successful</div>
            <div>Document ID: {result.documentId || result.document?.id || "--"}</div>
            {result.fileUrl && (
              <div>
                File URL: <a className="text-blue-600 underline" href={result.fileUrl} target="_blank" rel="noreferrer">open</a>
              </div>
            )}
            {(result.documentId || result.document?.id) && (
              <div className="mt-2">
                <a
                  className="text-blue-600 underline"
                  href={`/timeline/${result.documentId || result.document?.id}`}
                >
                  View Timeline
                </a>
              </div>
            )}
            <details className="mt-3">
              <summary className="cursor-pointer text-muted-foreground">Show raw response</summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(result, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
