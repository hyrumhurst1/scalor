# Scalor

**Empirical Big-O Complexity Analyzer.** Paste a function, get AI-derived time + space complexity plus an empirical runtime curve at scale.

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

```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env                              # set ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000

# frontend (new terminal)
cd web
pnpm install
pnpm dev
```

Open http://localhost:3000.

## License

MIT
