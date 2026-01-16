-- Chemistry Arena Database Schema for Supabase
-- Run this in the Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MODELS TABLE
-- Stores LLM model definitions
-- ============================================
CREATE TABLE IF NOT EXISTS models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    description TEXT,
    api_model_name TEXT,  -- Actual API model name to use
    is_new BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial models
INSERT INTO models (id, name, provider, description, api_model_name, is_new, is_active) VALUES
    ('gpt-5', 'GPT-5', 'OpenAI', 'Latest GPT model with enhanced reasoning', 'gpt-4o', TRUE, TRUE),
    ('gpt-4o', 'GPT-4o', 'OpenAI', 'Optimized multimodal GPT-4', 'gpt-4o', FALSE, TRUE),
    ('claude-opus-4', 'Claude Opus 4', 'Anthropic', 'Most capable Claude model', 'claude-sonnet-4-20250514', TRUE, TRUE),
    ('claude-sonnet-4', 'Claude Sonnet 4', 'Anthropic', 'Balanced performance and speed', 'claude-sonnet-4-20250514', FALSE, TRUE),
    ('gemini-2.5-pro', 'Gemini 2.5 Pro', 'Google', 'Advanced reasoning model', 'gemini-1.5-pro', FALSE, TRUE),
    ('gemini-2.5-flash', 'Gemini 2.5 Flash', 'Google', 'Fast and efficient', 'gemini-1.5-flash', FALSE, TRUE),
    ('deepseek-r1', 'DeepSeek R1', 'DeepSeek', 'Reasoning-focused model', 'deepseek-reasoner', FALSE, TRUE),
    ('deepseek-v3', 'DeepSeek V3', 'DeepSeek', 'General purpose model', 'deepseek-chat', FALSE, TRUE),
    ('llama-4-405b', 'Llama 4 405B', 'Meta', 'Largest Llama model', NULL, TRUE, TRUE),
    ('mistral-large', 'Mistral Large 2', 'Mistral', 'Flagship Mistral model', NULL, FALSE, TRUE),
    ('qwen-max', 'Qwen Max', 'Alibaba', 'Leading Chinese LLM', NULL, FALSE, TRUE),
    ('grok-3', 'Grok 3', 'xAI', 'xAI flagship model', NULL, TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    provider = EXCLUDED.provider,
    description = EXCLUDED.description,
    api_model_name = EXCLUDED.api_model_name,
    is_new = EXCLUDED.is_new,
    is_active = EXCLUDED.is_active;

-- ============================================
-- PROMPTS TABLE
-- Stores chemistry questions/problems
-- ============================================
CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('organic', 'inorganic', 'physical', 'analytical', 'biochemistry', 'computational')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial prompts
INSERT INTO prompts (id, category, difficulty, text) VALUES
    -- Organic Chemistry
    ('org-1', 'organic', 'medium', 'Propose a retrosynthetic analysis for the synthesis of ibuprofen from benzene. Include all key disconnections and suggest appropriate reagents for each forward step.'),
    ('org-2', 'organic', 'hard', 'Explain the mechanism of the Diels-Alder reaction between 1,3-butadiene and maleic anhydride. Discuss the stereochemistry, endo/exo selectivity, and frontier molecular orbital theory.'),
    ('org-3', 'organic', 'medium', 'Compare and contrast SN1 and SN2 reaction mechanisms. Provide examples and discuss factors that favor each pathway.'),
    
    -- Inorganic Chemistry
    ('inorg-1', 'inorganic', 'hard', 'Using crystal field theory, explain why [Co(NH3)6]³⁺ is diamagnetic while [CoF6]³⁻ is paramagnetic. Calculate the crystal field splitting energy for each complex.'),
    ('inorg-2', 'inorganic', 'medium', 'Describe the bonding in ferrocene using molecular orbital theory. Explain why it exhibits aromatic character.'),
    
    -- Physical Chemistry
    ('phys-1', 'physical', 'hard', 'Derive the Michaelis-Menten equation from first principles. Explain the significance of Km and Vmax and how they can be determined experimentally using Lineweaver-Burk plots.'),
    ('phys-2', 'physical', 'medium', 'Calculate the equilibrium constant for the reaction 2NO₂(g) ⇌ N₂O₄(g) at 25°C given ΔG° = -4.7 kJ/mol. Explain how temperature affects this equilibrium.'),
    
    -- Analytical Chemistry
    ('anal-1', 'analytical', 'medium', 'Interpret the following ¹H NMR spectrum: A compound C₈H₁₀O shows peaks at δ 7.2 (5H, m), δ 3.6 (2H, t), δ 2.8 (2H, t), and δ 2.1 (1H, br s, D₂O exchangeable). Propose a structure.'),
    ('anal-2', 'analytical', 'hard', 'Design an HPLC method for separating a mixture of caffeine, aspirin, and acetaminophen. Specify column type, mobile phase, detection method, and expected retention order.'),
    
    -- Biochemistry
    ('biochem-1', 'biochemistry', 'medium', 'Explain the complete mechanism of ATP synthesis in mitochondria, including the electron transport chain and chemiosmotic coupling.'),
    ('biochem-2', 'biochemistry', 'hard', 'Describe the mechanism of DNA replication in E. coli, including the roles of all major enzymes involved. Explain how proofreading maintains fidelity.'),
    
    -- Computational Chemistry
    ('comp-1', 'computational', 'hard', 'Compare DFT functionals (B3LYP, M06-2X, ωB97X-D) for calculating the barrier height of a hydrogen atom transfer reaction. Discuss accuracy vs computational cost trade-offs.'),
    ('comp-2', 'computational', 'medium', 'Explain how molecular dynamics simulations can be used to study protein folding. Discuss force field selection and simulation timescale considerations.')
ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    difficulty = EXCLUDED.difficulty,
    text = EXCLUDED.text;

-- ============================================
-- BATTLES TABLE
-- Stores battle instances
-- ============================================
CREATE TABLE IF NOT EXISTS battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id TEXT NOT NULL REFERENCES prompts(id),
    model_a_id TEXT NOT NULL REFERENCES models(id),
    model_b_id TEXT NOT NULL REFERENCES models(id),
    response_a TEXT NOT NULL,
    response_b TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_battles_prompt ON battles(prompt_id);
CREATE INDEX IF NOT EXISTS idx_battles_created ON battles(created_at DESC);

-- ============================================
-- VOTES TABLE
-- Stores user votes on battles
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_id UUID NOT NULL REFERENCES battles(id),
    winner TEXT NOT NULL CHECK (winner IN ('A', 'B', 'tie')),
    voter_session TEXT,  -- Optional session ID for rate limiting
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_votes_battle ON votes(battle_id);
CREATE INDEX IF NOT EXISTS idx_votes_created ON votes(created_at DESC);

-- ============================================
-- MODEL_RATINGS TABLE
-- Stores overall Elo ratings for each model
-- ============================================
CREATE TABLE IF NOT EXISTS model_ratings (
    model_id TEXT PRIMARY KEY REFERENCES models(id),
    elo INTEGER DEFAULT 1500,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize ratings for all models
INSERT INTO model_ratings (model_id, elo, wins, losses, ties)
SELECT id, 1500, 0, 0, 0 FROM models
ON CONFLICT (model_id) DO NOTHING;

-- ============================================
-- CATEGORY_RATINGS TABLE
-- Stores per-category Elo ratings
-- ============================================
CREATE TABLE IF NOT EXISTS category_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id TEXT NOT NULL REFERENCES models(id),
    category TEXT NOT NULL CHECK (category IN ('organic', 'inorganic', 'physical', 'analytical', 'biochemistry', 'computational')),
    elo INTEGER DEFAULT 1500,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(model_id, category)
);

-- Initialize category ratings for all model/category combinations
INSERT INTO category_ratings (model_id, category, elo, wins, losses, ties)
SELECT m.id, c.category, 1500, 0, 0, 0
FROM models m
CROSS JOIN (
    SELECT unnest(ARRAY['organic', 'inorganic', 'physical', 'analytical', 'biochemistry', 'computational']) as category
) c
ON CONFLICT (model_id, category) DO NOTHING;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_category_ratings_model ON category_ratings(model_id);
CREATE INDEX IF NOT EXISTS idx_category_ratings_category ON category_ratings(category);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View: Overall leaderboard
CREATE OR REPLACE VIEW leaderboard_overall AS
SELECT 
    m.id as model_id,
    m.name as model_name,
    m.provider,
    m.is_new,
    r.elo,
    r.wins,
    r.losses,
    r.ties,
    CASE 
        WHEN (r.wins + r.losses + r.ties) > 0 
        THEN ROUND((r.wins + r.ties * 0.5)::numeric / (r.wins + r.losses + r.ties)::numeric, 4)
        ELSE 0 
    END as win_rate,
    CASE 
        WHEN (r.wins + r.losses + r.ties) >= 100 THEN 1.0
        ELSE ROUND((r.wins + r.losses + r.ties)::numeric / 100.0, 2)
    END as confidence,
    (r.wins + r.losses + r.ties) as total_matches,
    r.updated_at
FROM models m
JOIN model_ratings r ON m.id = r.model_id
WHERE m.is_active = TRUE
ORDER BY r.elo DESC;

-- View: Category leaderboards (use with WHERE category = '...')
CREATE OR REPLACE VIEW leaderboard_by_category AS
SELECT 
    m.id as model_id,
    m.name as model_name,
    m.provider,
    m.is_new,
    cr.category,
    cr.elo,
    cr.wins,
    cr.losses,
    cr.ties,
    CASE 
        WHEN (cr.wins + cr.losses + cr.ties) > 0 
        THEN ROUND((cr.wins + cr.ties * 0.5)::numeric / (cr.wins + cr.losses + cr.ties)::numeric, 4)
        ELSE 0 
    END as win_rate,
    CASE 
        WHEN (cr.wins + cr.losses + cr.ties) >= 100 THEN 1.0
        ELSE ROUND((cr.wins + cr.losses + cr.ties)::numeric / 100.0, 2)
    END as confidence,
    (cr.wins + cr.losses + cr.ties) as total_matches,
    cr.updated_at
FROM models m
JOIN category_ratings cr ON m.id = cr.model_id
WHERE m.is_active = TRUE
ORDER BY cr.category, cr.elo DESC;

-- ============================================
-- ROW LEVEL SECURITY (optional but recommended)
-- ============================================

-- Enable RLS on tables
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read battles" ON battles FOR SELECT USING (true);
CREATE POLICY "Allow read votes" ON votes FOR SELECT USING (true);

-- Allow insert for all (could restrict to authenticated only)
CREATE POLICY "Allow insert battles" ON battles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert votes" ON votes FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS FOR RATING UPDATES
-- ============================================

-- Function to update ratings after a vote
CREATE OR REPLACE FUNCTION update_ratings_after_vote(
    p_battle_id UUID,
    p_winner TEXT
) RETURNS void AS $$
DECLARE
    v_model_a TEXT;
    v_model_b TEXT;
    v_category TEXT;
    v_elo_a INTEGER;
    v_elo_b INTEGER;
    v_k_factor INTEGER := 32;
    v_expected_a FLOAT;
    v_expected_b FLOAT;
    v_score_a FLOAT;
    v_score_b FLOAT;
    v_new_elo_a INTEGER;
    v_new_elo_b INTEGER;
BEGIN
    -- Get battle info
    SELECT b.model_a_id, b.model_b_id, p.category
    INTO v_model_a, v_model_b, v_category
    FROM battles b
    JOIN prompts p ON b.prompt_id = p.id
    WHERE b.id = p_battle_id;
    
    -- Get current ratings
    SELECT elo INTO v_elo_a FROM model_ratings WHERE model_id = v_model_a;
    SELECT elo INTO v_elo_b FROM model_ratings WHERE model_id = v_model_b;
    
    -- Calculate expected scores
    v_expected_a := 1.0 / (1.0 + POWER(10, (v_elo_b - v_elo_a)::float / 400.0));
    v_expected_b := 1.0 - v_expected_a;
    
    -- Determine actual scores
    IF p_winner = 'A' THEN
        v_score_a := 1.0;
        v_score_b := 0.0;
    ELSIF p_winner = 'B' THEN
        v_score_a := 0.0;
        v_score_b := 1.0;
    ELSE  -- tie
        v_score_a := 0.5;
        v_score_b := 0.5;
    END IF;
    
    -- Calculate new Elo ratings
    v_new_elo_a := ROUND(v_elo_a + v_k_factor * (v_score_a - v_expected_a));
    v_new_elo_b := ROUND(v_elo_b + v_k_factor * (v_score_b - v_expected_b));
    
    -- Update overall ratings
    UPDATE model_ratings SET 
        elo = v_new_elo_a,
        wins = wins + CASE WHEN p_winner = 'A' THEN 1 ELSE 0 END,
        losses = losses + CASE WHEN p_winner = 'B' THEN 1 ELSE 0 END,
        ties = ties + CASE WHEN p_winner = 'tie' THEN 1 ELSE 0 END,
        updated_at = NOW()
    WHERE model_id = v_model_a;
    
    UPDATE model_ratings SET 
        elo = v_new_elo_b,
        wins = wins + CASE WHEN p_winner = 'B' THEN 1 ELSE 0 END,
        losses = losses + CASE WHEN p_winner = 'A' THEN 1 ELSE 0 END,
        ties = ties + CASE WHEN p_winner = 'tie' THEN 1 ELSE 0 END,
        updated_at = NOW()
    WHERE model_id = v_model_b;
    
    -- Also update category-specific ratings
    -- Get category Elo ratings
    SELECT elo INTO v_elo_a FROM category_ratings WHERE model_id = v_model_a AND category = v_category;
    SELECT elo INTO v_elo_b FROM category_ratings WHERE model_id = v_model_b AND category = v_category;
    
    -- Recalculate for category
    v_expected_a := 1.0 / (1.0 + POWER(10, (v_elo_b - v_elo_a)::float / 400.0));
    v_new_elo_a := ROUND(v_elo_a + v_k_factor * (v_score_a - v_expected_a));
    v_new_elo_b := ROUND(v_elo_b + v_k_factor * (v_score_b - (1.0 - v_expected_a)));
    
    UPDATE category_ratings SET 
        elo = v_new_elo_a,
        wins = wins + CASE WHEN p_winner = 'A' THEN 1 ELSE 0 END,
        losses = losses + CASE WHEN p_winner = 'B' THEN 1 ELSE 0 END,
        ties = ties + CASE WHEN p_winner = 'tie' THEN 1 ELSE 0 END,
        updated_at = NOW()
    WHERE model_id = v_model_a AND category = v_category;
    
    UPDATE category_ratings SET 
        elo = v_new_elo_b,
        wins = wins + CASE WHEN p_winner = 'B' THEN 1 ELSE 0 END,
        losses = losses + CASE WHEN p_winner = 'A' THEN 1 ELSE 0 END,
        ties = ties + CASE WHEN p_winner = 'tie' THEN 1 ELSE 0 END,
        updated_at = NOW()
    WHERE model_id = v_model_b AND category = v_category;
END;
$$ LANGUAGE plpgsql;

