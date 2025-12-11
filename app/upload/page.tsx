"use client";
import { useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { FileUp, CheckCircle2, UploadCloud, File as FileIcon, Info, Paperclip } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [percent, setPercent] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) setFile(f as File);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  }, [dragOver]);

  const onDragLeave = useCallback(() => setDragOver(false), []);
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
      // Fake client-side progress for UX
      setPercent(15);
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
      setPercent(90);
      setResult(json || { success: true });
      setPercent(100);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Upload Document</h1>
          <p className="text-sm text-muted-foreground">Supported: PDF, PNG, JPG. Files are private; access via signed URLs.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left: Uploader */}
          <div className="md:col-span-2">
            <Card className="border-border bg-card">
              <div className="p-6 space-y-5">
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={
                    "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors " +
                    (dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:bg-muted/30")
                  }
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    Drag & drop your file here or
                    <span className="mx-1 font-medium text-foreground">browse</span>
                    to upload
                  </div>
                  {/* Visually-hidden input to avoid native 'no file chosen' text */}
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                  <label htmlFor="file">
                    <Button type="button" variant="secondary" className="gap-2">
                      <Paperclip className="h-4 w-4" />
                      Attach
                    </Button>
                  </label>
                </div>

                {/* Selected file summary */}
                {file && (
                  <div className="flex items-center gap-3 rounded-md border p-3 text-sm">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "unknown"}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => setFile(null)} disabled={loading}>
                      Clear
                    </Button>
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Info className="h-3.5 w-3.5" />
                      Max size ~10MB. For larger scanned PDFs, OCR fallback may take longer.
                    </div>
                    <Button type="submit" disabled={!file || loading} className="gap-2">
                      {loading ? <Spinner className="h-4 w-4" /> : <FileUp className="h-4 w-4" />}
                      {loading ? "Uploading…" : "Upload"}
                    </Button>
                  </div>

                  {loading && (
                    <div className="pt-1">
                      <Progress value={percent} />
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {result && (
                    <div className="rounded-md border p-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Upload successful</span>
                      </div>
                      <Separator className="my-3" />
                      <div className="space-y-1 text-sm">
                        <div>Document ID: {result.documentId || result.document?.id || "--"}</div>
                        {result.fileUrl && (
                          <div>
                            File URL: <a className="text-blue-600 underline" href={result.fileUrl} target="_blank" rel="noreferrer">open</a>
                          </div>
                        )}
                        {(result.documentId || result.document?.id) && (
                          <div className="pt-2">
                            <a className="text-blue-600 underline" href={`/timeline/${result.documentId || result.document?.id}`}>
                              Open Timeline
                            </a>
                          </div>
                        )}
                        <details className="pt-2">
                          <summary className="cursor-pointer text-muted-foreground">Show raw response</summary>
                          <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(result, null, 2)}</pre>
                        </details>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </Card>
          </div>

          {/* Right: Tips / Help */}
          <div className="md:col-span-1">
            <Card className="border-border bg-card">
              <div className="p-5 space-y-3 text-sm">
                <div className="font-medium">Tips</div>
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                  <li>Prefer text PDFs for best accuracy. Scanned PDFs use OCR fallback.</li>
                  <li>Include clear dates (YYYY-MM-DD) for stronger timeline results.</li>
                  <li>Use simple tables or an "Events Log" section for reliable parsing.</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
