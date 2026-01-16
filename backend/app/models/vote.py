"""
Vote-related Pydantic models.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Literal, Optional


class VoteCreate(BaseModel):
    """Request to submit a vote."""
    winner: Literal["A", "B", "tie"]
    voter_session: Optional[str] = None  # For rate limiting / analytics


class VoteResponse(BaseModel):
    """Response after submitting a vote."""
    id: str
    battle_id: str
    winner: Literal["A", "B", "tie"]
    model_a_id: str
    model_a_name: str
    model_b_id: str
    model_b_name: str
    created_at: datetime
    message: str = "Vote recorded successfully"

