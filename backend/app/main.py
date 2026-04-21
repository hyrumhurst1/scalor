"""Scalor backend — static-only v1.

Exposes POST /analyze. Sends the code to Claude Sonnet 4.6 and asks for strict
JSON via tool use. If ANTHROPIC_API_KEY is missing, empty, 'mock', or the
placeholder 'sk-ant-...', a canned response is returned so the frontend demos
offline.

SECURITY:
- This service NEVER executes user code. No exec, eval, subprocess, Docker.
- Empirical execution is deferred to v2 behind a sandbox (Firecracker / gVisor).
"""
from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import AnalyzeRequest, AnalyzeResponse

load_dotenv()

MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6")
MAX_LINES = 300
PLACEHOLDER_KEY = "sk-ant-..."

app = FastAPI(title="Scalor", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Mock response (used when no API key is configured)
# ---------------------------------------------------------------------------

_MOCK_RESPONSE = AnalyzeResponse(
    time_complexity="O(n log n)",
    space_complexity="O(n)",
    reasoning=(
        "Mock analysis (no ANTHROPIC_API_KEY configured). Assuming the snippet "
        "performs a comparison sort on the input list, the dominant cost is the "
        "sort itself at O(n log n) with O(n) auxiliary space for the output or "
        "working buffers. Set ANTHROPIC_API_KEY in backend/.env for real analysis."
    ),
    dominant_operation="sorted()/Array.sort call on the input",
    inputs_to_vary=["arr"],
)


# ---------------------------------------------------------------------------
# Prompt + tool schema
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """You are a senior algorithms engineer. You analyze a single \
function and report its asymptotic time and space complexity.

Rules:
- Always respond by calling the `report_complexity` tool — never reply in prose.
- Use standard Big-O notation, e.g. "O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)", "O(2^n)".
- When multiple inputs drive complexity, use multiple variables, e.g. "O(n + m)" or "O(n*m)".
- `reasoning` must be 1-3 sentences explaining the bound.
- `dominant_operation` names the single loop or call that drives the cost, with a line
  reference when obvious (e.g. "nested loop on line 4").
- `inputs_to_vary` lists parameter NAMES whose size drives complexity (no types).
- If the code is unparseable or too ambiguous, set time_complexity to "unknown" and explain in reasoning."""

_TOOL_SCHEMA: dict[str, Any] = {
    "name": "report_complexity",
    "description": "Report the Big-O time and space complexity of the supplied function.",
    "input_schema": {
        "type": "object",
        "properties": {
            "time_complexity": {
                "type": "string",
                "description": "Big-O time complexity, e.g. 'O(n log n)'.",
            },
            "space_complexity": {
                "type": "string",
                "description": "Big-O space complexity, e.g. 'O(n)'.",
            },
            "reasoning": {
                "type": "string",
                "description": "1-3 sentence explanation of the bound.",
            },
            "dominant_operation": {
                "type": "string",
                "description": "The single operation driving the cost, with a line hint if obvious.",
            },
            "inputs_to_vary": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Parameter names whose size drives complexity.",
            },
        },
        "required": [
            "time_complexity",
            "space_complexity",
            "reasoning",
            "dominant_operation",
            "inputs_to_vary",
        ],
    },
}


def _build_user_prompt(code: str, language: str) -> str:
    return (
        f"Analyze the complexity of this {language} function and call the "
        "`report_complexity` tool with the result.\n\n"
        f"```{language}\n{code}\n```"
    )


# ---------------------------------------------------------------------------
# Claude call (tool use for structured output)
# ---------------------------------------------------------------------------


def _call_claude(code: str, language: str) -> AnalyzeResponse:
    # Imported lazily so mock-mode doesn't require the SDK to be wired up.
    from anthropic import Anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    client = Anthropic(api_key=api_key)

    message = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=_SYSTEM_PROMPT,
        tools=[_TOOL_SCHEMA],
        tool_choice={"type": "tool", "name": "report_complexity"},
        messages=[{"role": "user", "content": _build_user_prompt(code, language)}],
    )

    for block in message.content:
        if getattr(block, "type", None) == "tool_use" and block.name == "report_complexity":
            return AnalyzeResponse(**block.input)

    raise ValueError("Claude did not return a tool_use block for report_complexity.")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
def health() -> dict[str, str]:
    mode = "mock" if _is_mock_mode() else "live"
    return {"status": "ok", "mode": mode, "model": MODEL}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    line_count = req.code.count("\n") + 1
    if line_count > MAX_LINES:
        raise HTTPException(
            status_code=413,
            detail=f"Input too large: {line_count} lines (max {MAX_LINES}).",
        )

    if _is_mock_mode():
        return _MOCK_RESPONSE

    try:
        return _call_claude(req.code, req.language)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001 — surface a clean 502 to the client
        raise HTTPException(status_code=502, detail=f"Claude call failed: {exc}") from exc


# ---------------------------------------------------------------------------
# Empirical runner — v2 stub. Do NOT implement without a real sandbox.
# ---------------------------------------------------------------------------


@app.post("/run_empirical")
def run_empirical() -> dict[str, str]:
    # v2: sandboxed execution via Firecracker / gVisor
    raise HTTPException(
        status_code=501,
        detail="Empirical runner is deferred to v2 behind a hardware-isolated sandbox.",
    )


def _is_mock_mode() -> bool:
    key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if not key:
        return True
    if key.lower() == "mock":
        return True
    if key == PLACEHOLDER_KEY:
        return True
    return False
