import fs from "fs";
import path from "path";
import Link from "next/link";

export const dynamic = "force-dynamic";

function isDev() {
  return process.env.NODE_ENV !== "production";
}

function getLogsDir() {
  return path.join(process.cwd(), "logs");
}

export default async function LogsAdminPage() {
  if (!isDev()) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-muted-foreground">Logs admin is available only in development.</div>
      </div>
    );
  }

  const dir = getLogsDir();
  let files: { name: string; size: number; mtime: string }[] = [];
  try {
    if (fs.existsSync(dir)) {
      const list = fs.readdirSync(dir);
      files = list.map((name) => {
        const stat = fs.statSync(path.join(dir, name));
        return { name, size: stat.size, mtime: stat.mtime.toISOString() };
      });
    }
  } catch {}

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Logs (dev)</h1>
          <Link href="/documents" className="text-sm text-blue-600 hover:underline">Back to Documents</Link>
        </div>

        {files.length === 0 ? (
          <div className="text-sm text-muted-foreground">No logs found in <code className="px-1 py-0.5 rounded bg-muted">/logs</code>.</div>
        ) : (
          <div className="overflow-hidden rounded border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3">File</th>
                  <th className="text-left p-3">Size</th>
                  <th className="text-left p-3">Modified</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.name} className="border-t">
                    <td className="p-3 font-mono">{f.name}</td>
                    <td className="p-3 tabular-nums">{f.size} B</td>
                    <td className="p-3">{new Date(f.mtime).toLocaleString()}</td>
                    <td className="p-3">
                      <a
                        className="text-blue-600 hover:underline"
                        href={`/api/admin/logs?file=${encodeURIComponent(f.name)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Inline previews */}
        {files.map((f) => {
          let content = "";
          try {
            const p = path.join(dir, f.name);
            content = fs.readFileSync(p, "utf8");
          } catch {}
          return (
            <div key={`preview-${f.name}`} className="rounded border p-3">
              <div className="mb-2 text-sm font-medium">{f.name}</div>
              <pre className="text-xs overflow-auto whitespace-pre-wrap leading-relaxed max-h-96">{content}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}

