# Scalor — Build Spec

## Goal

Paste a function → get time + space complexity (Claude) and (v2) an empirical runtime curve at scale.

## Stack (fixed for v1)

- Backend: Python 3.11+, FastAPI, Pydantic, `anthropic`
- Frontend: Next.js 14 App Router, TypeScript, Tailwind, Monaco editor, Recharts
- Two folders: `backend/` and `web/`

## MVP build order (static-only v1)

1. `web/`: Monaco editor, language dropdown (Python / JavaScript for v1).
2. `POST /analyze` on FastAPI. Body: `{ code: str, language: "python" | "javascript" }`.
3. Claude Sonnet 4.6 call with structured output:
   ```json
   {
     "time_complexity": "O(n log n)",
     "space_complexity": "O(n)",
     "reasoning": "...",
     "dominant_operation": "sort on line 4",
     "inputs_to_vary": ["arr"]
   }
   ```
4. Return to frontend, render complexity badges + reasoning.
5. Recharts placeholder for empirical curve (v2) with disabled "Run empirical" button.

## Out of scope for v1 (EXPLICIT — DO NOT BUILD)

- **Do not** execute user code. The empirical sandbox is a security minefield — gVisor / Firecracker only, not plain Docker. Defer.
- Auth, persistence, sharing.

## v2 (not now)

- Empirical runner (isolated sandbox, hard CPU/memory/wall-clock limits, stdlib-only imports whitelist).
- Plot theoretical vs measured curves, flag mismatches.

## Model routing

- **Sonnet 4.6** (`claude-sonnet-4-6`) — complexity analysis needs real reasoning, Haiku will hallucinate.

## Gotchas

- Cap input length at ~300 lines to control cost.
- Never eval, exec, or subprocess user input in v1.
- CORS: backend on 8000, frontend on 3000 — set `allow_origins=["http://localhost:3000"]`.
