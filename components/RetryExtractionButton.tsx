"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RetryExtractionButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  async function onClick() {
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 202) {
        setMsg("Processing started…");
      } else if (!res.ok) {
        throw new Error(json?.error || `Extraction failed (${res.status})`);
      } else {
        setMsg("Extraction completed");
      }
      // Start polling for timeline events
      setPolling(true);
      const maxTries = 12; // ~60s if 5s interval
      for (let i = 0; i < maxTries; i++) {
        setPollCount(i + 1);
        const tl = await fetch(`/api/documents/${documentId}/timeline`, { cache: "no-store" });
        if (tl.ok) {
          const data = await tl.json().catch(() => ({}));
          const count = Array.isArray(data?.timeline) ? data.timeline.length : 0;
          if (count > 0) {
            setMsg(`Events detected (${count}).`);
            setPolling(false);
            router.refresh();
            break;
          }
        }
        await new Promise((r) => setTimeout(r, 5000));
        if (i === maxTries - 1) {
          setMsg("Still processing… check again shortly.");
          setPolling(false);
        }
      }
    } catch (e: any) {
      setErr(e?.message || "Retry failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        disabled={loading || polling}
        className="px-3 py-1.5 rounded bg-primary text-primary-foreground disabled:opacity-50"
      >
        {(loading || polling) ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {polling ? `Polling… (${pollCount})` : "Retrying…"}
          </span>
        ) : (
          "Retry extraction"
        )}
      </button>
      {msg && <span className="text-xs text-amber-600">{msg}</span>}
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
