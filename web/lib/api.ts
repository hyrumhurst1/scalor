export type Language = "python" | "javascript";

export interface AnalyzeResponse {
  time_complexity: string;
  space_complexity: string;
  reasoning: string;
  dominant_operation: string;
  inputs_to_vary: string[];
}

export interface HealthResponse {
  status: string;
  mode: "mock" | "live";
  model: string;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

export async function analyzeCode(
  code: string,
  language: Language,
): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, language }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Analyze failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as AnalyzeResponse;
}

export async function fetchHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}
