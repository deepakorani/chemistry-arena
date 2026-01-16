/**
 * API client for Chemistry Arena backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types matching the backend Pydantic models
export interface BattleResponse {
  id: string;
  prompt_id: string;
  prompt_text: string;
  prompt_category: string;
  prompt_difficulty: string;
  model_a_id: string;
  model_b_id: string;
  response_a: string;
  response_b: string;
  created_at: string;
}

export interface VoteResponse {
  id: string;
  battle_id: string;
  winner: 'A' | 'B' | 'tie';
  model_a_id: string;
  model_a_name: string;
  model_b_id: string;
  model_b_name: string;
  created_at: string;
  message: string;
}

export interface LeaderboardEntry {
  rank: number;
  model_id: string;
  model_name: string;
  provider: string;
  elo: number;
  wins: number;
  losses: number;
  ties: number;
  win_rate: number;
  confidence: number;
  total_matches: number;
  is_new: boolean;
  trend?: 'up' | 'down' | 'stable';
  rank_change?: number;
}

export interface LeaderboardResponse {
  category: string | null;
  entries: LeaderboardEntry[];
  total_battles: number;
  last_updated: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description?: string;
  is_new: boolean;
  is_active: boolean;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  total_battles: number;
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new APIError(response.status, error.detail || 'Request failed');
  }
  
  return response.json();
}

// Battle API
export const battlesAPI = {
  /**
   * Create a new battle
   */
  async create(category?: string): Promise<BattleResponse> {
    return fetchAPI<BattleResponse>('/api/battles/new', {
      method: 'POST',
      body: JSON.stringify({ category }),
    });
  },
  
  /**
   * Submit a vote for a battle
   */
  async vote(
    battleId: string,
    winner: 'A' | 'B' | 'tie',
    voterSession?: string
  ): Promise<VoteResponse> {
    return fetchAPI<VoteResponse>(`/api/battles/${battleId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ winner, voter_session: voterSession }),
    });
  },
  
  /**
   * Get battle details (after voting)
   */
  async get(battleId: string): Promise<BattleResponse> {
    return fetchAPI<BattleResponse>(`/api/battles/${battleId}`);
  },
};

// Leaderboard API
export const leaderboardAPI = {
  /**
   * Get overall leaderboard
   */
  async getOverall(limit: number = 20): Promise<LeaderboardResponse> {
    return fetchAPI<LeaderboardResponse>(`/api/leaderboard?limit=${limit}`);
  },
  
  /**
   * Get category-specific leaderboard
   */
  async getByCategory(
    category: string,
    limit: number = 20
  ): Promise<LeaderboardResponse> {
    return fetchAPI<LeaderboardResponse>(
      `/api/leaderboard/${category}?limit=${limit}`
    );
  },
  
  /**
   * Get list of categories
   */
  async getCategories(): Promise<CategoryInfo[]> {
    return fetchAPI<CategoryInfo[]>('/api/leaderboard/categories');
  },
};

// Models API
export const modelsAPI = {
  /**
   * Get list of available models
   */
  async getAll(activeOnly: boolean = true): Promise<ModelInfo[]> {
    return fetchAPI<ModelInfo[]>(`/api/models?active_only=${activeOnly}`);
  },
  
  /**
   * Get a specific model
   */
  async get(modelId: string): Promise<ModelInfo> {
    return fetchAPI<ModelInfo>(`/api/models/${modelId}`);
  },
};

// Export a unified API object
export const api = {
  battles: battlesAPI,
  leaderboard: leaderboardAPI,
  models: modelsAPI,
};

export default api;

