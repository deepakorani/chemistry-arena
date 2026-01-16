"""
Supabase database connection and client.
"""

from supabase import create_client, Client
from functools import lru_cache
from app.config import get_settings


@lru_cache()
def get_supabase_client() -> Client:
    """
    Create and cache Supabase client.
    Uses lru_cache to ensure single instance.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_key)


def get_db() -> Client:
    """Dependency for FastAPI routes."""
    return get_supabase_client()

