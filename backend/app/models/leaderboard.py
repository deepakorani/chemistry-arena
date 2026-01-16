"""
Leaderboard-related Pydantic models.
"""

from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class ModelStats(BaseModel):
    """Statistics for a single model."""
    model_id: str
    model_name: str
    provider: str
    elo: int
    wins: int
    losses: int
    ties: int
    win_rate: float
    confidence: float
    total_matches: int
    is_new: bool = False


class LeaderboardEntry(BaseModel):
    """A single entry in the leaderboard."""
    rank: int
    model_id: str
    model_name: str
    provider: str
    elo: int
    wins: int
    losses: int
    ties: int
    win_rate: float
    confidence: float
    total_matches: int
    is_new: bool = False
    trend: Optional[Literal["up", "down", "stable"]] = None
    rank_change: Optional[int] = None


class LeaderboardResponse(BaseModel):
    """Full leaderboard response."""
    category: Optional[str] = None  # None means overall
    entries: list[LeaderboardEntry]
    total_battles: int
    last_updated: datetime


class CategoryInfo(BaseModel):
    """Information about a chemistry category."""
    id: str
    name: str
    description: str
    icon: str
    total_battles: int = 0

