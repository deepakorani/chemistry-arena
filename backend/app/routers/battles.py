"""
Battle API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.database import get_db
from app.models.battle import BattleCreate, BattleResponse, BattleResult
from app.models.vote import VoteCreate, VoteResponse
from app.services.battle_service import BattleService
from app.services.rating_service import RatingService

router = APIRouter()


@router.post("/new", response_model=BattleResponse)
async def create_battle(
    request: BattleCreate,
    db: Client = Depends(get_db)
):
    """
    Create a new battle.
    
    - Selects a random prompt (optionally filtered by category)
    - Picks two random models
    - Calls LLM APIs to generate responses
    - Returns battle data (model identities hidden)
    """
    battle_service = BattleService(db)
    try:
        battle = await battle_service.create_battle(category=request.category)
        return battle
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{battle_id}/vote", response_model=VoteResponse)
async def submit_vote(
    battle_id: str,
    request: VoteCreate,
    db: Client = Depends(get_db)
):
    """
    Submit a vote for a battle.
    
    - Records the vote
    - Updates model ratings using Bradley-Terry
    - Returns vote confirmation with revealed model identities
    """
    battle_service = BattleService(db)
    rating_service = RatingService(db)
    
    try:
        # Record the vote
        vote = await battle_service.record_vote(
            battle_id=battle_id,
            winner=request.winner,
            voter_session=request.voter_session
        )
        
        # Update ratings
        await rating_service.update_ratings_for_vote(battle_id, request.winner)
        
        return vote
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{battle_id}", response_model=BattleResult)
async def get_battle(
    battle_id: str,
    db: Client = Depends(get_db)
):
    """
    Get battle details (after voting).
    """
    battle_service = BattleService(db)
    try:
        battle = await battle_service.get_battle_result(battle_id)
        return battle
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

