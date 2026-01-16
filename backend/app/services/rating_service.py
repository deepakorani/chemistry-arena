"""
Rating Service - Bradley-Terry Model Implementation

The Bradley-Terry model is a probability model for pairwise comparisons.
It estimates the "strength" of each competitor based on win/loss records.

For models i and j, the probability that i beats j is:
P(i > j) = p_i / (p_i + p_j)

where p_i and p_j are the strength parameters.

This is a Python port of the TypeScript implementation in bradley-terry.ts
"""

from typing import Optional, Literal
from datetime import datetime
from dataclasses import dataclass
import math

from supabase import Client

from app.models.leaderboard import LeaderboardEntry, LeaderboardResponse, CategoryInfo


@dataclass
class MatchResult:
    """A single match result."""
    model_a: str
    model_b: str
    winner: Literal["A", "B", "tie"]


@dataclass
class BradleyTerryResult:
    """Result of Bradley-Terry estimation."""
    ratings: dict[str, float]
    iterations: int
    converged: bool


class BradleyTerryModel:
    """
    Bradley-Terry model implementation for estimating model strengths.
    """
    
    def __init__(
        self,
        models: list[str],
        match_results: list[MatchResult],
        max_iterations: int = 200,
        convergence_threshold: float = 0.0001
    ):
        self.models = models
        self.match_results = match_results
        self.max_iterations = max_iterations
        self.convergence_threshold = convergence_threshold
    
    def _compute_win_matrix(self) -> dict[str, dict[str, float]]:
        """Compute win counts for each model against each other model."""
        win_matrix: dict[str, dict[str, float]] = {}
        
        # Initialize matrix
        for model in self.models:
            win_matrix[model] = {other: 0.0 for other in self.models}
        
        # Count wins
        for match in self.match_results:
            if match.winner == "A":
                win_matrix[match.model_a][match.model_b] += 1
            elif match.winner == "B":
                win_matrix[match.model_b][match.model_a] += 1
            else:  # tie
                win_matrix[match.model_a][match.model_b] += 0.5
                win_matrix[match.model_b][match.model_a] += 0.5
        
        return win_matrix
    
    def _compute_comparison_counts(self) -> dict[str, dict[str, int]]:
        """Compute total number of comparisons between each pair."""
        counts: dict[str, dict[str, int]] = {}
        
        for model in self.models:
            counts[model] = {other: 0 for other in self.models}
        
        for match in self.match_results:
            counts[match.model_a][match.model_b] += 1
            counts[match.model_b][match.model_a] += 1
        
        return counts
    
    def estimate(self) -> BradleyTerryResult:
        """Run the Bradley-Terry estimation algorithm."""
        win_matrix = self._compute_win_matrix()
        comparison_counts = self._compute_comparison_counts()
        
        # Initialize all ratings to 1
        ratings = {model: 1.0 for model in self.models}
        
        iteration = 0
        converged = False
        
        while iteration < self.max_iterations and not converged:
            new_ratings: dict[str, float] = {}
            max_change = 0.0
            
            for model in self.models:
                # Compute total wins for this model
                total_wins = sum(
                    win_matrix[model][other]
                    for other in self.models
                    if other != model
                )
                
                # Compute denominator sum
                denom_sum = 0.0
                for other in self.models:
                    if other != model:
                        n_comparisons = comparison_counts[model][other]
                        if n_comparisons > 0:
                            denom_sum += n_comparisons / (ratings[model] + ratings[other])
                
                # Update rating
                if denom_sum > 0:
                    new_ratings[model] = total_wins / denom_sum
                else:
                    new_ratings[model] = ratings[model]
                
                # Track convergence
                change = abs(new_ratings[model] - ratings[model])
                if change > max_change:
                    max_change = change
            
            # Normalize ratings (sum to number of models)
            rating_sum = sum(new_ratings.values())
            norm_factor = len(self.models) / rating_sum if rating_sum > 0 else 1.0
            for model in self.models:
                ratings[model] = new_ratings[model] * norm_factor
            
            iteration += 1
            converged = max_change < self.convergence_threshold
        
        # Convert to Elo-style ratings (centered at 1500)
        elo_ratings: dict[str, float] = {}
        base_elo = 1500
        scale_factor = 400
        
        # Use geometric mean as reference
        log_sum = sum(math.log(r) for r in ratings.values() if r > 0)
        log_mean = log_sum / len(self.models) if self.models else 0
        reference_power = math.exp(log_mean)
        
        for model in self.models:
            if ratings[model] > 0 and reference_power > 0:
                elo_ratings[model] = round(
                    base_elo + scale_factor * math.log10(ratings[model] / reference_power)
                )
            else:
                elo_ratings[model] = base_elo
        
        return BradleyTerryResult(
            ratings=elo_ratings,
            iterations=iteration,
            converged=converged
        )
    
    def calculate_confidence(self, model_id: str) -> float:
        """Calculate confidence interval based on number of matches."""
        total_matches = sum(
            1 for match in self.match_results
            if match.model_a == model_id or match.model_b == model_id
        )
        # Full confidence at 100+ matches
        return min(1.0, total_matches / 100)


def calculate_win_rate(
    model_id: str,
    match_results: list[MatchResult]
) -> tuple[int, int, int, float]:
    """
    Calculate win rate from match results.
    
    Returns:
        Tuple of (wins, losses, ties, win_rate)
    """
    wins = 0
    losses = 0
    ties = 0
    
    for match in match_results:
        if match.model_a == model_id:
            if match.winner == "A":
                wins += 1
            elif match.winner == "B":
                losses += 1
            else:
                ties += 1
        elif match.model_b == model_id:
            if match.winner == "B":
                wins += 1
            elif match.winner == "A":
                losses += 1
            else:
                ties += 1
    
    total = wins + losses + ties
    win_rate = (wins + ties * 0.5) / total if total > 0 else 0
    
    return wins, losses, ties, win_rate


class RatingService:
    """
    Service for managing model ratings and leaderboards.
    """
    
    CATEGORIES = [
        CategoryInfo(
            id="admet",
            name="ADMET Prediction",
            description="Predict toxicity, lipophilicity, pKa, and solubility properties",
            icon="🧬"
        ),
        CategoryInfo(
            id="optimization",
            name="Molecule Optimization",
            description="Design compounds with improved solubility, stability, and reduced toxicity",
            icon="⚗️"
        ),
        CategoryInfo(
            id="notation",
            name="Notation Conversion",
            description="Convert between SMILES, IUPAC names, and other chemical notations",
            icon="🔄"
        ),
    ]
    
    def __init__(self, db: Client):
        self.db = db
    
    async def get_leaderboard(
        self,
        category: Optional[str] = None,
        limit: int = 20
    ) -> LeaderboardResponse:
        """
        Get leaderboard data.
        
        Args:
            category: If provided, get category-specific leaderboard
            limit: Maximum number of entries to return
        """
        if category:
            # Use category leaderboard view
            result = self.db.table("leaderboard_by_category") \
                .select("*") \
                .eq("category", category) \
                .order("elo", desc=True) \
                .limit(limit) \
                .execute()
        else:
            # Use overall leaderboard view
            result = self.db.table("leaderboard_overall") \
                .select("*") \
                .order("elo", desc=True) \
                .limit(limit) \
                .execute()
        
        entries = []
        for i, row in enumerate(result.data):
            entries.append(LeaderboardEntry(
                rank=i + 1,
                model_id=row["model_id"],
                model_name=row["model_name"],
                provider=row["provider"],
                elo=row["elo"],
                wins=row["wins"],
                losses=row["losses"],
                ties=row["ties"],
                win_rate=float(row["win_rate"]),
                confidence=float(row["confidence"]),
                total_matches=row["total_matches"],
                is_new=row.get("is_new", False),
                trend=None,  # Could calculate from historical data
                rank_change=None
            ))
        
        # Get total battle count
        battle_count = self.db.table("battles").select("id", count="exact").execute()
        total_battles = battle_count.count or 0
        
        return LeaderboardResponse(
            category=category,
            entries=entries,
            total_battles=total_battles,
            last_updated=datetime.now()
        )
    
    async def get_categories(self) -> list[CategoryInfo]:
        """Get list of categories with battle counts."""
        categories = []
        
        for cat in self.CATEGORIES:
            # Count battles in this category
            result = self.db.table("battles") \
                .select("id", count="exact") \
                .eq("prompts.category", cat.id) \
                .execute()
            
            categories.append(CategoryInfo(
                id=cat.id,
                name=cat.name,
                description=cat.description,
                icon=cat.icon,
                total_battles=result.count or 0
            ))
        
        return categories
    
    async def update_ratings_for_vote(
        self,
        battle_id: str,
        winner: Literal["A", "B", "tie"]
    ) -> None:
        """
        Update ratings after a vote using the database function.
        
        This calls the SQL function that handles Elo updates for both
        overall and category-specific ratings.
        """
        # Call the database function
        self.db.rpc("update_ratings_after_vote", {
            "p_battle_id": battle_id,
            "p_winner": winner
        }).execute()
    
    async def recalculate_all_ratings(self) -> None:
        """
        Recalculate all ratings from scratch using Bradley-Terry.
        
        This is useful for periodic batch updates or initial setup.
        """
        # Get all models
        models_result = self.db.table("models") \
            .select("id") \
            .eq("is_active", True) \
            .execute()
        model_ids = [m["id"] for m in models_result.data]
        
        # Get all votes with battle info
        votes_result = self.db.table("votes") \
            .select("*, battles(model_a_id, model_b_id, prompts(category))") \
            .execute()
        
        # Convert to match results
        match_results = [
            MatchResult(
                model_a=v["battles"]["model_a_id"],
                model_b=v["battles"]["model_b_id"],
                winner=v["winner"]
            )
            for v in votes_result.data
            if v.get("battles")
        ]
        
        if not match_results:
            return
        
        # Run Bradley-Terry estimation
        bt_model = BradleyTerryModel(models=model_ids, match_results=match_results)
        result = bt_model.estimate()
        
        # Update overall ratings
        for model_id in model_ids:
            wins, losses, ties, win_rate = calculate_win_rate(model_id, match_results)
            
            self.db.table("model_ratings").upsert({
                "model_id": model_id,
                "elo": int(result.ratings.get(model_id, 1500)),
                "wins": wins,
                "losses": losses,
                "ties": ties,
                "updated_at": datetime.now().isoformat()
            }).execute()
        
        # Also recalculate per-category ratings
        for category in ["admet", "optimization", "notation"]:
            category_matches = [
                MatchResult(
                    model_a=v["battles"]["model_a_id"],
                    model_b=v["battles"]["model_b_id"],
                    winner=v["winner"]
                )
                for v in votes_result.data
                if v.get("battles") and v["battles"].get("prompts", {}).get("category") == category
            ]
            
            if category_matches:
                bt_category = BradleyTerryModel(models=model_ids, match_results=category_matches)
                category_result = bt_category.estimate()
                
                for model_id in model_ids:
                    wins, losses, ties, _ = calculate_win_rate(model_id, category_matches)
                    
                    self.db.table("category_ratings").upsert({
                        "model_id": model_id,
                        "category": category,
                        "elo": int(category_result.ratings.get(model_id, 1500)),
                        "wins": wins,
                        "losses": losses,
                        "ties": ties,
                        "updated_at": datetime.now().isoformat()
                    }, on_conflict="model_id,category").execute()

