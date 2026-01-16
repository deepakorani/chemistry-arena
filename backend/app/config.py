"""
Application configuration using pydantic-settings.
Loads environment variables from .env file.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase (optional - will use mock mode if not set)
    supabase_url: str = ""
    supabase_key: str = ""
    
    # OpenRouter API Key (single key for all LLMs)
    openrouter_api_key: str = ""
    
    # Legacy individual API Keys (optional fallback)
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    google_api_key: str = ""
    deepseek_api_key: str = ""
    
    # App Settings - support both CORS_ORIGIN and CORS_ORIGINS
    cors_origins: str = ""
    cors_origin: str = ""  # Alternative name
    debug: bool = False
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        # Use whichever is set: cors_origins or cors_origin
        origins_str = self.cors_origins or self.cors_origin or "http://localhost:3000"
        origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]
        # Always include common development origins
        default_origins = ["http://localhost:3000", "http://localhost:3001"]
        all_origins = list(set(origins + default_origins))
        print(f"🔒 CORS origins configured: {all_origins}")
        return all_origins
    
    @property
    def use_mock_db(self) -> bool:
        """Check if we should use mock database (no Supabase configured)."""
        return not self.supabase_url or not self.supabase_key


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()

