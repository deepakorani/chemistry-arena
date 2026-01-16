"""
Models API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import Optional

from app.database import get_db
from app.models.battle import ModelInfo, PromptInfo

router = APIRouter()


@router.get("", response_model=list[ModelInfo])
async def get_models(
    active_only: bool = True,
    db: Client = Depends(get_db)
):
    """
    Get list of available LLM models.
    """
    try:
        query = db.table("models").select("*")
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{model_id}", response_model=ModelInfo)
async def get_model(
    model_id: str,
    db: Client = Depends(get_db)
):
    """
    Get details for a specific model.
    """
    try:
        result = db.table("models").select("*").eq("id", model_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Model not found")
        
        m = result.data
        return ModelInfo(
            id=m["id"],
            name=m["name"],
            provider=m["provider"],
            description=m.get("description"),
            is_new=m.get("is_new", False),
            is_active=m.get("is_active", True)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/prompts/", response_model=list[PromptInfo])
async def get_prompts(
    category: Optional[str] = None,
    db: Client = Depends(get_db)
):
    """
    Get list of chemistry prompts.
    """
    try:
        query = db.table("prompts").select("*")
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

