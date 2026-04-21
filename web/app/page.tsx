"use client";

import { useEffect, useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { ComplexityBadge } from "@/components/ComplexityBadge";
import { EmpiricalChart } from "@/components/EmpiricalChart";
import {
  AnalyzeResponse,
  Language,
  analyzeCode,
  fetchHealth,
} from "@/lib/api";

const SAMPLES: Record<Language, string> = {
  python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)


def merge(a, b):
    out = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    out.extend(a[i:]); out.extend(b[j:])
    return out
`,
  javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  return out.concat(a.slice(i)).concat(b.slice(j));
}
`,
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState<string>(SAMPLES.python);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [mockMode, setMockMode] = useState<boolean>(false);
  const [backendReachable, setBackendReachable] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const health = await fetchHealth();
      if (!health) {
        setBackendReachable(false);
        return;
      }
      setBackendReachable(true);
      setMockMode(health.mode === "mock");
    })();
  }, []);

  const handleLanguage = (next: Language) => {
    setLanguage(next);
    // Swap the sample only if the current buffer matches the other sample verbatim.
    if (code === SAMPLES.python || code === SAMPLES.javascript) {
      setCode(SAMPLES[next]);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeCode(code, language);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scalor</h1>
          <p className="text-sm text-zinc-400">
            Paste a function. Get its Big-O.
          </p>
        </div>
        <a
          className="text-xs text-zinc-500 hover:text-zinc-300"
          href="https://github.com/hyrumhurst1/scalor"
          target="_blank"
          rel="noreferrer"
        >
          github
        </a>
      </header>

      {!backendReachable && (
        <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          Backend at http://localhost:8000 is unreachable. Start it with{" "}
          <code className="font-mono">uvicorn app.main:app --reload --port 8000</code>.
        </div>
      )}

      {backendReachable && mockMode && (
        <div className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
          Mock mode — no <span className="font-mono">ANTHROPIC_API_KEY</span> set.
          Responses are canned. Put a real key in{" "}
          <span className="font-mono">backend/.env</span> for real analysis.
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <label className="text-xs uppercase tracking-wider text-zinc-500">
              language
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguage(e.target.value as Language)}
              className="rounded border border-edge bg-panel px-2 py-1 text-sm"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <CodeEditor value={code} onChange={setCode} language={language} />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={loading || !code.trim()}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-ink hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
            <button
              disabled
              title="Deferred to v2 behind a hardware-isolated sandbox."
              className="cursor-not-allowed rounded-md border border-edge bg-panel px-4 py-2 text-sm text-zinc-500"
            >
              Run empirical (v2)
            </button>
          </div>
        </div>

        <aside className="w-full lg:w-[360px]">
          <div className="grid grid-cols-2 gap-3">
            <ComplexityBadge
              label="time"
              value={result?.time_complexity ?? "—"}
              tone="time"
            />
            <ComplexityBadge
              label="space"
              value={result?.space_complexity ?? "—"}
              tone="space"
            />
          </div>

          <div className="mt-4 rounded-lg border border-edge bg-panel p-4">
            <div className="text-[11px] uppercase tracking-wider text-zinc-500">
              reasoning
            </div>
            {error ? (
              <p className="mt-2 text-sm text-red-300">{error}</p>
            ) : result ? (
              <>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">
                  {result.reasoning}
                </p>
                <dl className="mt-3 space-y-1 text-xs text-zinc-400">
                  <div>
                    <dt className="inline text-zinc-500">dominant: </dt>
                    <dd className="inline text-zinc-300">
                      {result.dominant_operation}
                    </dd>
                  </div>
                  {result.inputs_to_vary.length > 0 && (
                    <div>
                      <dt className="inline text-zinc-500">inputs: </dt>
                      <dd className="inline font-mono text-zinc-300">
                        {result.inputs_to_vary.join(", ")}
                      </dd>
                    </div>
                  )}
                </dl>
              </>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">
                Hit Analyze to see Claude&apos;s complexity verdict.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm uppercase tracking-wider text-zinc-500">
          Theoretical vs measured (v2)
        </h2>
        <EmpiricalChart />
        <p className="mt-2 text-xs text-zinc-500">
          Empirical execution is deferred to v2 behind a hardware-isolated
          sandbox (Firecracker / gVisor).
        </p>
      </section>
    </main>
  );
}
