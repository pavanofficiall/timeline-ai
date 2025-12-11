"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { FileUp, CheckCircle2 } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [percent, setPercent] = useState<number>(0);
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
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Upload Document</h1>
          <p className="text-sm text-muted-foreground">PDF/PNG/JPG supported. Files are stored privately with signed access.</p>
        </div>

        <Card className="border-border bg-card">
          <div className="p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="file">Choose file</Label>
                <div className="flex items-center gap-3">
                  <Input id="file" type="file" accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <Button type="submit" disabled={!file || loading} className="gap-2">
                    <FileUp className="h-4 w-4" />
                    {loading ? "Uploading…" : "Upload"}
                  </Button>
                </div>
                {loading && (
                  <div className="pt-2">
                    <Progress value={percent} />
                  </div>
                )}
              </div>

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
                        <a className="text-blue-600 underline"
                           href={`/timeline/${result.documentId || result.document?.id}`}>Open Timeline</a>
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
    </div>
  );
}
