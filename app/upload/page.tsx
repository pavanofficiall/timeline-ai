"use client";
import { useCallback, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  FileUp,
  CheckCircle2,
  UploadCloud,
  File as FileIcon,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileAudio2,
  FileVideo2,
  Image as ImageIcon,
  Info,
  Paperclip,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [percent, setPercent] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function getFileMeta(f: File | null) {
    const def = { label: "File", Icon: FileIcon, classes: "bg-muted text-muted-foreground" };
    if (!f) return def;
    const name = f.name.toLowerCase();
    const ext = name.includes(".") ? name.split(".").pop() || "" : "";
    const byExt = (e: string) => ext === e;
    const isImage = (/
      jpg|jpeg|png|gif|webp|bmp|tiff
    /i).test(ext);
    if (byExt("pdf")) return { label: "PDF", Icon: FileText, classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200" };
    if (byExt("doc") || byExt("docx")) return { label: "DOC", Icon: FileText, classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200" };
    if (byExt("xls") || byExt("xlsx") || byExt("csv")) return { label: "Sheet", Icon: FileSpreadsheet, classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200" };
    if (byExt("ppt") || byExt("pptx")) return { label: "Slides", Icon: FileText, classes: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200" };
    if (byExt("zip") || byExt("rar") || byExt("7z")) return { label: "Archive", Icon: FileArchive, classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200" };
    if (byExt("mp3") || byExt("wav")) return { label: "Audio", Icon: FileAudio2, classes: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200" };
    if (byExt("mp4") || byExt("mov") || byExt("mkv")) return { label: "Video", Icon: FileVideo2, classes: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200" };
    if (isImage) return { label: "Image", Icon: ImageIcon, classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200" };
    if (byExt("txt") || byExt("md")) return { label: "Text", Icon: FileText, classes: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-200" };
    return def;
  }

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
                  {/* Hidden input + programmatic click */}
                  <input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                    Attach
                  </Button>
                </div>

                {/* Selected file summary */}
                {file && (() => {
                  const meta = getFileMeta(file);
                  return (
                    <div className="flex items-center gap-3 rounded-md border p-3 text-sm">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-md ${meta.classes}`}>
                        <meta.Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="truncate font-medium">{file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {meta.label}
                        </div>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => setFile(null)} disabled={loading}>
                        Clear
                      </Button>
                    </div>
                  );
                })()}

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
