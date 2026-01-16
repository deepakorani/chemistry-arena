"""
Battle-related Pydantic models.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal


class BattleCreate(BaseModel):
    """Request to create a new battle."""
    category: Optional[str] = None  # If None, random category


class BattleResponse(BaseModel):
    """Response containing battle data."""
    id: str
    prompt_id: str
    prompt_text: str
    prompt_category: str
    prompt_difficulty: str
    model_a_id: str  # Hidden from client until vote
    model_b_id: str  # Hidden from client until vote
    response_a: str
    response_b: str
    created_at: datetime


class BattleResult(BaseModel):
    """Battle result after voting - reveals model identities."""
    id: str
    prompt_text: str
    prompt_category: str
    model_a_id: str
    model_a_name: str
    model_a_provider: str
    model_b_id: str
    model_b_name: str
    model_b_provider: str
    response_a: str
    response_b: str
    winner: Literal["A", "B", "tie"]


class ModelInfo(BaseModel):
    """Model information."""
    id: str
    name: str
    provider: str
    description: Optional[str] = None
    is_new: bool = False
    is_active: bool = True


class PromptInfo(BaseModel):
    """Prompt/question information."""
    id: str
    category: str
    difficulty: str
    text: str

