"""
Battle Service - Manages battle creation and voting.
"""

import random
from typing import Optional, Literal
from datetime import datetime
import uuid

from supabase import Client

from app.models.battle import BattleResponse, BattleResult, ModelInfo, PromptInfo
from app.models.vote import VoteResponse
from app.services.llm_service import LLMService


class BattleService:
    """
    Service for managing battles between AI models.
    """
    
    def __init__(self, db: Client, use_mock_llm: bool = False):
        """
        Initialize battle service.
        
        Args:
            db: Supabase client
            use_mock_llm: If True, use mock LLM responses (for testing)
        """
        self.db = db
        self.llm_service = LLMService(use_mock=use_mock_llm)
    
    async def create_battle(
        self,
        category: Optional[str] = None
    ) -> BattleResponse:
        """
        Create a new battle.
        
        1. Select a random prompt (optionally filtered by category)
        2. Pick two random active models
        3. Call LLM APIs to generate responses
        4. Store battle in database
        5. Return battle data (model identities hidden)
        """
        # Get a random prompt
        prompt = await self._get_random_prompt(category)
        
        # Get two random models
        model_a, model_b = await self._get_random_model_pair()
        
        # Generate responses from both models
        response_a, response_b = await self.llm_service.generate_battle_responses(
            model_a_id=model_a["id"],
            model_a_provider=model_a["provider"],
            model_b_id=model_b["id"],
            model_b_provider=model_b["provider"],
            prompt=prompt["text"]
        )
        
        # Store battle in database
        battle_data = {
            "prompt_id": prompt["id"],
            "model_a_id": model_a["id"],
            "model_b_id": model_b["id"],
            "response_a": response_a,
            "response_b": response_b,
        }
        
        result = self.db.table("battles").insert(battle_data).execute()
        battle = result.data[0]
        
        return BattleResponse(
            id=battle["id"],
            prompt_id=prompt["id"],
            prompt_text=prompt["text"],
            prompt_category=prompt["category"],
            prompt_difficulty=prompt["difficulty"],
            model_a_id=model_a["id"],  # Could hide this from response if needed
            model_b_id=model_b["id"],
            response_a=response_a,
            response_b=response_b,
            created_at=datetime.fromisoformat(battle["created_at"].replace("Z", "+00:00"))
        )
    
    async def record_vote(
        self,
        battle_id: str,
        winner: Literal["A", "B", "tie"],
        voter_session: Optional[str] = None
    ) -> VoteResponse:
        """
        Record a vote for a battle.
        
        Args:
            battle_id: The battle UUID
            winner: 'A', 'B', or 'tie'
            voter_session: Optional session ID for rate limiting
        
        Returns:
            VoteResponse with vote confirmation and revealed model info
        """
        # Verify battle exists and get model info
        battle_result = self.db.table("battles") \
            .select("*, models_a:model_a_id(id, name, provider), models_b:model_b_id(id, name, provider)") \
            .eq("id", battle_id) \
            .single() \
            .execute()
        
        if not battle_result.data:
            raise ValueError(f"Battle not found: {battle_id}")
        
        battle = battle_result.data
        
        # Record the vote
        vote_data = {
            "battle_id": battle_id,
            "winner": winner,
            "voter_session": voter_session,
        }
        
        vote_result = self.db.table("votes").insert(vote_data).execute()
        vote = vote_result.data[0]
        
        return VoteResponse(
            id=vote["id"],
            battle_id=battle_id,
            winner=winner,
            model_a_id=battle["model_a_id"],
            model_a_name=battle["models_a"]["name"] if battle.get("models_a") else battle["model_a_id"],
            model_b_id=battle["model_b_id"],
            model_b_name=battle["models_b"]["name"] if battle.get("models_b") else battle["model_b_id"],
            created_at=datetime.fromisoformat(vote["created_at"].replace("Z", "+00:00")),
            message="Vote recorded successfully! Ratings updated."
        )
    
    async def get_battle_result(self, battle_id: str) -> BattleResult:
        """
        Get battle details with revealed model identities.
        
        This is called after voting to show the user which models they compared.
        """
        # Get battle with related data
        result = self.db.table("battles") \
            .select("""
                *,
                prompts(text, category),
                models_a:model_a_id(id, name, provider),
                models_b:model_b_id(id, name, provider),
                votes(winner)
            """) \
            .eq("id", battle_id) \
            .single() \
            .execute()
        
        if not result.data:
            raise ValueError(f"Battle not found: {battle_id}")
        
        battle = result.data
        
        # Get the most recent vote for this battle
        latest_vote = battle.get("votes", [{}])[-1] if battle.get("votes") else {}
        winner = latest_vote.get("winner", "tie")
        
        return BattleResult(
            id=battle["id"],
            prompt_text=battle["prompts"]["text"],
            prompt_category=battle["prompts"]["category"],
            model_a_id=battle["model_a_id"],
            model_a_name=battle["models_a"]["name"],
            model_a_provider=battle["models_a"]["provider"],
            model_b_id=battle["model_b_id"],
            model_b_name=battle["models_b"]["name"],
            model_b_provider=battle["models_b"]["provider"],
            response_a=battle["response_a"],
            response_b=battle["response_b"],
            winner=winner
        )
    
    async def _get_random_prompt(
        self,
        category: Optional[str] = None
    ) -> dict:
        """Get a random prompt, optionally filtered by category."""
        query = self.db.table("prompts").select("*")
        
        if category:
            query = query.eq("category", category)
        
        result = query.execute()
        
        if not result.data:
            raise ValueError(f"No prompts found for category: {category}")
        
        return random.choice(result.data)
    
    async def _get_random_model_pair(self) -> tuple[dict, dict]:
        """Get two random active models."""
        result = self.db.table("models") \
            .select("*") \
            .eq("is_active", True) \
            .execute()
        
        if len(result.data) < 2:
            raise ValueError("Not enough active models for a battle")
        
        # Shuffle and pick two
        models = result.data.copy()
        random.shuffle(models)
        
        return models[0], models[1]
    
    async def get_models(self, active_only: bool = True) -> list[ModelInfo]:
        """Get list of available models."""
        query = self.db.table("models").select("*")
        
        if active_only:
            query = query.eq("is_active", True)
        
        result = query.execute()
        
        return [
            ModelInfo(
                id=m["id"],
                name=m["name"],
                provider=m["provider"],
                description=m.get("description"),
                is_new=m.get("is_new", False),
                is_active=m.get("is_active", True)
            )
            for m in result.data
        ]
    
    async def get_prompts(
        self,
        category: Optional[str] = None
    ) -> list[PromptInfo]:
        """Get list of prompts, optionally filtered by category."""
        query = self.db.table("prompts").select("*")
        
        if category:
            query = query.eq("category", category)
        
        result = query.execute()
        
        return [
            PromptInfo(
                id=p["id"],
                category=p["category"],
                difficulty=p["difficulty"],
                text=p["text"]
            )
            for p in result.data
        ]

