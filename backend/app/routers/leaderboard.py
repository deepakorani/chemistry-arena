"""
Leaderboard API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from typing import Optional

from app.database import get_db
from app.models.leaderboard import LeaderboardResponse, CategoryInfo
from app.services.rating_service import RatingService

router = APIRouter()


@router.get("", response_model=LeaderboardResponse)
async def get_overall_leaderboard(
    limit: int = Query(default=20, ge=1, le=100),
    db: Client = Depends(get_db)
):
    """
    Get overall leaderboard across all categories.
    """
    rating_service = RatingService(db)
    try:
        leaderboard = await rating_service.get_leaderboard(limit=limit)
        return leaderboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories", response_model=list[CategoryInfo])
async def get_categories(db: Client = Depends(get_db)):
    """
    Get list of available chemistry categories.
    """
    rating_service = RatingService(db)
    try:
        categories = await rating_service.get_categories()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{category}", response_model=LeaderboardResponse)
async def get_category_leaderboard(
    category: str,
    limit: int = Query(default=20, ge=1, le=100),
    db: Client = Depends(get_db)
):
    """
    Get leaderboard for a specific chemistry category.
    """
    valid_categories = [
        "admet", "optimization", "notation"
    ]
    
    if category not in valid_categories:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
        )
    
    rating_service = RatingService(db)
    try:
        leaderboard = await rating_service.get_leaderboard(
            category=category, 
            limit=limit
        )
        return leaderboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

