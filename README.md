# Scalor

**Big-O Complexity Analyzer.** Paste a function, get AI-derived time + space complexity with reasoning. Empirical runtime curves against the theoretical prediction are coming in v2 (sandboxed execution — see SPEC).

## Stack

- Python + FastAPI backend
- Next.js + TypeScript + Recharts frontend
- Anthropic Claude Sonnet 4.6 (complexity reasoning)
- Docker sandbox for empirical runs _(deferred to v2 — see SPEC)_

## Features

- Static analysis: Claude returns time + space complexity, dominant operation, reasoning
- Empirical path _(v2)_: run function at input sizes [10, 100, 1k, 10k, 100k], plot measured curve against theoretical curve
- Flag mismatches between declared and measured complexity

## Quickstart

### Backend (FastAPI on :8000)

```bash
cd backend
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Windows cmd:
.venv\Scripts\activate.bat

pip install -r requirements.txt
cp ../.env.example .env   # Windows: copy ..\.env.example .env
# Edit .env — leave ANTHROPIC_API_KEY empty (or set to 'mock') to demo offline.

uvicorn app.main:app --reload --port 8000
```

Health check: `curl http://localhost:8000/health`.

### Frontend (Next.js on :3000)

```bash
cd web
pnpm install
pnpm dev
```

Then open http://localhost:3000.

### Mock mode

If `ANTHROPIC_API_KEY` is missing, empty, equals `mock`, or equals the
placeholder `sk-ant-...` from `.env.example`, `/analyze` returns a canned
`O(n log n)` verdict and the UI shows a "Mock mode" banner. Set a real key
in `backend/.env` to enable live Claude analysis.

### Production build check

```bash
cd web && pnpm build
```

## License

MIT
