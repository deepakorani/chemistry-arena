# Chemistry Arena - Python Backend

FastAPI backend for the Chemistry Arena application, providing API endpoints for battles, voting, and leaderboards.

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **Supabase** - PostgreSQL database with real-time features
- **OpenAI/Anthropic/Google** - LLM providers for generating responses

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# LLM API Keys (add the ones you have)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
DEEPSEEK_API_KEY=...

# App Settings
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DEBUG=true
```

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL from `supabase_schema.sql` to create all tables

### 4. Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Battles

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/battles/new` | POST | Create a new battle |
| `/api/battles/{id}/vote` | POST | Submit a vote |
| `/api/battles/{id}` | GET | Get battle details |

### Leaderboard

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leaderboard` | GET | Get overall rankings |
| `/api/leaderboard/{category}` | GET | Get category rankings |
| `/api/leaderboard/categories` | GET | List categories |

### Models

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/models` | GET | List available models |
| `/api/models/{id}` | GET | Get model details |

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry
│   ├── config.py            # Settings & env vars
│   ├── database.py          # Supabase connection
│   ├── models/              # Pydantic models
│   │   ├── battle.py
│   │   ├── vote.py
│   │   └── leaderboard.py
│   ├── services/
│   │   ├── llm_service.py   # Multi-provider LLM calls
│   │   ├── battle_service.py
│   │   └── rating_service.py
│   └── routers/
│       ├── battles.py
│       ├── leaderboard.py
│       └── models.py
├── supabase_schema.sql      # Database schema
├── requirements.txt
└── README.md
```

## LLM Providers

The backend supports multiple LLM providers:

| Provider | Models | Notes |
|----------|--------|-------|
| OpenAI | GPT-4o, GPT-5 | Requires `OPENAI_API_KEY` |
| Anthropic | Claude Opus 4, Sonnet 4 | Requires `ANTHROPIC_API_KEY` |
| Google | Gemini 2.5 Pro/Flash | Requires `GOOGLE_API_KEY` |
| DeepSeek | R1, V3 | Requires `DEEPSEEK_API_KEY` |

If an API key is missing, the backend will fall back to mock responses for that provider.

## Development

### Running Tests

```bash
pytest
```

### API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Frontend Integration

The Next.js frontend expects the backend at `http://localhost:8000` by default.

To change this, set the `NEXT_PUBLIC_API_URL` environment variable in the frontend:

```bash
# In the root project .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

