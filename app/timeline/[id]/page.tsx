"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Event = {
  id?: string;
  date?: string;
  title?: string;
  description?: string;
  confidence_score?: number;
};

type Party = { id?: string; name?: string; role?: string };
type Payment = { id?: string; amount?: string; currency?: string; payer?: string; payee?: string; date?: string };
type Missing = { id?: string; description?: string; reason?: string };

export default function TimelinePage() {
  const params = useParams<{ id: string }>();
  const docId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [data, setData] = useState<{
    document?: any;
    timeline: Event[];
    parties: Party[];
    payments: Payment[];
    missing: Missing[];
  }>({ timeline: [], parties: [], payments: [], missing: [] });
  const [counts, setCounts] = useState({ ev: 0, pa: 0, pay: 0, miss: 0 });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/documents/${docId}/timeline`);
        if (!res.ok) throw new Error("Failed to fetch timeline");
        const json = await res.json();
        if (active) {
          setData(json);
          const ev = Array.isArray(json?.timeline) ? json.timeline.length : 0;
          const pa = Array.isArray(json?.parties) ? json.parties.length : 0;
          const pay = Array.isArray(json?.payments) ? json.payments.length : 0;
          const miss = Array.isArray(json?.missing) ? json.missing.length : 0;
          setCounts({ ev, pa, pay, miss });
          if (process.env.NODE_ENV === "development") {
            // Lightweight client-side debug to help verify data presence
            // eslint-disable-next-line no-console
            console.log("[timeline] id=", docId, "counts:", { ev, pa, pay, miss });
          }
        }
      } catch (e: any) {
        if (active) setError(e?.message || "Failed to load");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (docId) load();
    return () => {
      active = false;
    };
  }, [docId]);

  async function handleRetry() {
    if (!docId) return;
    setRetrying(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 202) {
        setNotice("Processing started. Refresh in a moment.");
      } else if (!res.ok) {
        throw new Error(json?.error || `Extraction failed (${res.status})`);
      } else {
        setNotice("Extraction completed. Timeline refreshed.");
      }
      // Re-fetch timeline after retry
      setLoading(true);
      const tl = await fetch(`/api/documents/${docId}/timeline`);
      if (tl.ok) {
        const j = await tl.json();
        setData(j);
      }
    } catch (e: any) {
      setError(e?.message || "Retry failed");
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }

  const filename = data?.document?.filename || data?.document?.file_name || "Document";
  const status = data?.document?.status || data?.document?.engine || "unknown";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{filename}</h1>
            <p className="text-sm text-muted-foreground">Status: {String(status).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-3">
            {notice && <span className="text-sm text-amber-600">{notice}</span>}
            {loading && <span className="text-sm text-muted-foreground">Loading…</span>}
            {error && <span className="text-sm text-red-500">{error}</span>}
            {process.env.NODE_ENV === "development" && (
              <span className="text-xs rounded px-2 py-1 bg-muted text-muted-foreground">
                id:{docId?.slice(0, 8)} ev:{counts.ev} pa:{counts.pa} pay:{counts.pay} miss:{counts.miss}
              </span>
            )}
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-3 py-1.5 rounded bg-primary text-primary-foreground disabled:opacity-50"
            >
              {retrying ? "Retrying…" : "Retry extraction"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Timeline */}
          <div className="md:col-span-2">
            <div className="relative pl-6">
              {/* vertical line */}
              <div className="absolute left-2 top-0 bottom-0 w-px bg-border" aria-hidden />
              <div className="space-y-6">
                {data.timeline?.length ? (
                  data.timeline.map((ev, idx) => {
                    const d = ev.date ? new Date(ev.date) : null;
                    const dateStr = d ? d.toLocaleDateString() : "Date unknown";
                    const conf = typeof ev.confidence_score === "number" ? ev.confidence_score : undefined;
                    const confColor = conf != null ? (conf > 0.8 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700") : "bg-gray-100 text-gray-700";
                    const confLabel = conf != null ? conf.toFixed(2) : "--";
                    return (
                      <div key={ev.id || idx} className="relative">
                        {/* dot */}
                        <div className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-primary" />
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-blue-600">{dateStr}</div>
                          <div className="mt-1 text-base font-medium">{ev.title || "Untitled Event"}</div>
                          {ev.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{ev.description}</p>
                          )}
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${confColor}`}>
                              Confidence: {confLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground">No events found.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Missing Documents */}
            <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-400/30">
              <h2 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-3">Missing Documents</h2>
              <div className="space-y-3">
                {data.missing?.length ? (
                  data.missing.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="rounded-md bg-white dark:bg-background border border-red-200 dark:border-red-400/30 p-3 shadow-sm"
                    >
                      <div className="text-sm font-medium text-red-700 dark:text-red-300">
                        {m.description || "Missing item"}
                      </div>
                      {m.reason ? (
                        <p className="text-xs text-red-600 dark:text-red-200 mt-1">Reason: {m.reason}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">Reason: —</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-red-600 dark:text-red-300">No missing documents identified.</div>
                )}
              </div>
            </div>

            {/* Identified Parties */}
            <div className="rounded-lg border p-4">
              <h2 className="text-sm font-semibold mb-3">Identified Parties</h2>
              <ul className="space-y-2">
                {data.parties?.length ? (
                  data.parties.map((p, idx) => (
                    <li key={p.id || idx} className="text-sm">
                      <span className="font-medium">{p.name || "Unnamed"}</span>
                      {p.role && <span className="text-muted-foreground"> — {p.role}</span>}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted-foreground">No parties detected.</li>
                )}
              </ul>
            </div>

            {/* Payments */}
            <div className="rounded-lg border p-4">
              <h2 className="text-sm font-semibold mb-3">Payments</h2>
              <div className="space-y-2">
                {data.payments?.length ? (
                  data.payments.map((pm, idx) => (
                    <div key={pm.id || idx} className="text-sm">
                      <div className="font-medium">{pm.amount ? `${pm.amount} ${pm.currency || ""}` : "Amount N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        {pm.payer ? `From: ${pm.payer}` : "From: N/A"} {pm.payee ? `→ To: ${pm.payee}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">{pm.date ? new Date(pm.date).toLocaleDateString() : "Date unknown"}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">No payments recorded.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
