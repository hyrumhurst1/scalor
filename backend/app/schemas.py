"""Pydantic models for the /analyze request and response."""
from __future__ import annotations

from typing import List, Literal

from pydantic import BaseModel, Field

Language = Literal["python", "javascript"]


class AnalyzeRequest(BaseModel):
    code: str = Field(..., description="Source of the function to analyze.")
    language: Language = Field(..., description="Source language.")


class AnalyzeResponse(BaseModel):
    """Structured complexity verdict returned by Claude.

    Field order mirrors SPEC.md so the JSON payload matches the docs.
    """

    time_complexity: str = Field(..., description="Big-O time complexity, e.g. 'O(n log n)'.")
    space_complexity: str = Field(..., description="Big-O space complexity, e.g. 'O(n)'.")
    reasoning: str = Field(..., description="Short human-readable explanation.")
    dominant_operation: str = Field(
        ..., description="The single operation driving complexity, with line hint if possible."
    )
    inputs_to_vary: List[str] = Field(
        default_factory=list,
        description="Names of inputs whose size drives complexity — useful for the v2 empirical runner.",
    )


class ErrorResponse(BaseModel):
    detail: str
