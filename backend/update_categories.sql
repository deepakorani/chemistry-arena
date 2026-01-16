-- Chemistry Arena - Updated Categories for Drug Discovery
-- Run this in Supabase SQL Editor to update categories and prompts

-- Delete in correct order (respecting foreign keys)
DELETE FROM votes;
DELETE FROM battles;
DELETE FROM category_ratings;
DELETE FROM prompts;

-- Update the category constraint on prompts table
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_category_check;
ALTER TABLE prompts ADD CONSTRAINT prompts_category_check 
  CHECK (category IN ('admet', 'optimization', 'notation'));

-- Update the category constraint on category_ratings table
ALTER TABLE category_ratings DROP CONSTRAINT IF EXISTS category_ratings_category_check;
ALTER TABLE category_ratings ADD CONSTRAINT category_ratings_category_check 
  CHECK (category IN ('admet', 'optimization', 'notation'));

-- ============================================
-- NEW PROMPTS: ADMET Property Prediction
-- ============================================
INSERT INTO prompts (id, category, difficulty, text) VALUES
-- Toxicity
('admet-tox-1', 'admet', 'medium', 
 'Predict the potential hepatotoxicity of the following compound: CC(=O)Nc1ccc(O)cc1 (Paracetamol/Acetaminophen). Explain the metabolic pathway that could lead to liver damage and identify the toxic metabolite.'),

('admet-tox-2', 'admet', 'hard', 
 'Given the SMILES: CN1C=NC2=C1C(=O)N(C(=O)N2C)C, predict potential cardiotoxicity risks. Consider hERG channel interactions and provide a risk assessment.'),

('admet-tox-3', 'admet', 'medium', 
 'Analyze the mutagenicity potential of this aromatic amine: Nc1ccc2ccccc2c1 (2-Naphthylamine). What structural features contribute to its carcinogenic properties?'),

-- Lipophilicity
('admet-logp-1', 'admet', 'easy', 
 'Estimate the LogP value for Ibuprofen (SMILES: CC(C)Cc1ccc(cc1)C(C)C(=O)O). Explain which structural features contribute to its lipophilicity.'),

('admet-logp-2', 'admet', 'medium', 
 'Compare the lipophilicity (LogP) of these two compounds and explain the differences: 1) c1ccccc1 (Benzene) vs 2) c1ccc(O)cc1 (Phenol)'),

('admet-logp-3', 'admet', 'hard', 
 'For the compound CC(C)(C)c1ccc(cc1)C(O)c2ccccc2, estimate LogP and LogD at pH 7.4. Explain how ionization affects the distribution coefficient.'),

-- pKa
('admet-pka-1', 'admet', 'medium', 
 'Predict the pKa values for all ionizable groups in Aspirin (SMILES: CC(=O)Oc1ccccc1C(=O)O). Which group is most acidic and why?'),

('admet-pka-2', 'admet', 'hard', 
 'Estimate the pKa of the amino group in Amphetamine (SMILES: CC(N)Cc1ccccc1). How does the aromatic ring affect the basicity compared to a simple alkyl amine?'),

('admet-pka-3', 'admet', 'medium', 
 'Compare the pKa values of phenol (c1ccc(O)cc1) and p-nitrophenol (O=[N+]([O-])c1ccc(O)cc1). Explain the electronic effects at play.'),

-- Solubility
('admet-sol-1', 'admet', 'easy', 
 'Predict the aqueous solubility of Caffeine (SMILES: Cn1cnc2c1c(=O)n(c(=O)n2C)C). What structural features make it relatively water-soluble?'),

('admet-sol-2', 'admet', 'medium', 
 'Rank these compounds by aqueous solubility and explain: 1) Naphthalene 2) 2-Naphthol 3) 2-Naphthoic acid'),

('admet-sol-3', 'admet', 'hard', 
 'For Carbamazepine (SMILES: NC(=O)N1c2ccccc2C=Cc3ccccc13), predict solubility and suggest two structural modifications to improve it without losing CNS activity.');

-- ============================================
-- NEW PROMPTS: Molecule Optimization
-- ============================================
INSERT INTO prompts (id, category, difficulty, text) VALUES
-- Solubility improvement
('opt-sol-1', 'optimization', 'medium', 
 'The compound CC(C)Cc1ccc(cc1)C(C)C(=O)O (Ibuprofen) has limited aqueous solubility. Propose 3 structural modifications to improve water solubility while maintaining anti-inflammatory activity.'),

('opt-sol-2', 'optimization', 'hard', 
 'Design a prodrug strategy for the poorly soluble compound: c1ccc2c(c1)cc3ccccc3n2 (Acridine). The prodrug should be water-soluble and release the parent compound in vivo.'),

('opt-sol-3', 'optimization', 'medium', 
 'Given this lead compound with poor solubility: CC1=CC=C(C=C1)C2=CC(=O)C3=CC=CC=C3O2, suggest modifications using the "3 salt" approach or adding solubilizing groups.'),

-- Stability improvement
('opt-stab-1', 'optimization', 'medium', 
 'This ester prodrug hydrolyzes too quickly: CC(=O)Oc1ccc(cc1)C(C)C(=O)O. Suggest modifications to increase plasma stability while maintaining eventual release of the active metabolite.'),

('opt-stab-2', 'optimization', 'hard', 
 'The peptide-like compound H-Phe-Gly-Gly-OH is rapidly degraded by proteases. Design 3 different strategies to improve metabolic stability while retaining biological activity.'),

('opt-stab-3', 'optimization', 'medium', 
 'This aldehyde-containing drug is unstable: O=Cc1ccc(O)c(OC)c1 (Vanillin derivative). Propose bioisosteric replacements for the aldehyde group.'),

-- Toxicity reduction
('opt-tox-1', 'optimization', 'hard', 
 'The compound c1ccc(N)cc1N (o-Phenylenediamine) is mutagenic. Propose structural modifications to reduce genotoxicity while maintaining the diamine functionality for chelation purposes.'),

('opt-tox-2', 'optimization', 'medium', 
 'This nitro compound shows efficacy but has toxicity issues: [O-][N+](=O)c1ccc(N)cc1. Suggest safer bioisosteric replacements for the nitro group.'),

('opt-tox-3', 'optimization', 'hard', 
 'Design an optimized version of Chloramphenicol (reduce hematotoxicity) while maintaining antibacterial activity. Original SMILES: O=C(NC(CO)C(O)c1ccc([N+]([O-])=O)cc1)C(Cl)Cl');

-- ============================================
-- NEW PROMPTS: Notation Conversion
-- ============================================
INSERT INTO prompts (id, category, difficulty, text) VALUES
-- SMILES to IUPAC
('not-s2i-1', 'notation', 'easy', 
 'Convert this SMILES to its IUPAC name: CC(C)Cc1ccc(cc1)C(C)C(=O)O'),

('not-s2i-2', 'notation', 'medium', 
 'Provide the IUPAC systematic name for: CC(C)(C)NCC(O)c1ccc(O)c(O)c1'),

('not-s2i-3', 'notation', 'hard', 
 'Give the complete IUPAC name including stereochemistry for: C[C@H](N)[C@@H](O)c1ccc(O)c(O)c1'),

('not-s2i-4', 'notation', 'medium', 
 'Convert to IUPAC name: CN1C=NC2=C1C(=O)N(C(=O)N2C)C'),

('not-s2i-5', 'notation', 'hard', 
 'Provide the IUPAC name for this complex structure: CC(=O)OCC(=O)[C@@]1(O)CC[C@H]2[C@@H]3CCC4=CC(=O)CC[C@]4(C)[C@H]3[C@@H](O)C[C@@]21C'),

-- IUPAC to SMILES
('not-i2s-1', 'notation', 'easy', 
 'Convert "2-acetoxybenzoic acid" (Aspirin) to its SMILES representation.'),

('not-i2s-2', 'notation', 'medium', 
 'Write the SMILES for "4-hydroxy-3-methoxybenzaldehyde" (Vanillin).'),

('not-i2s-3', 'notation', 'hard', 
 'Generate the SMILES with correct stereochemistry for "(2R,3S)-2,3-dihydroxybutanedioic acid" (L-Tartaric acid).'),

('not-i2s-4', 'notation', 'medium', 
 'Convert "N-(4-hydroxyphenyl)acetamide" to SMILES.'),

('not-i2s-5', 'notation', 'hard', 
 'Write the SMILES for "(1R,2R)-1,2-diphenylethane-1,2-diol" with correct stereochemistry.'),

-- Common name conversions
('not-com-1', 'notation', 'easy', 
 'Convert "Caffeine" to its SMILES representation.'),

('not-com-2', 'notation', 'medium', 
 'What is the SMILES for "Dopamine"? Also provide its IUPAC name.'),

('not-com-3', 'notation', 'medium', 
 'Given the SMILES CC12CCC3C(C1CCC2O)CCC4=C3C=CC(=C4)O, identify the common name of this compound.'),

('not-com-4', 'notation', 'hard', 
 'The drug "Atorvastatin" - provide both its SMILES and IUPAC name.'),

('not-com-5', 'notation', 'easy', 
 'Convert "Glucose" to SMILES. Specify whether you are representing alpha or beta form, and linear or cyclic.');

-- ============================================
-- Initialize category ratings for all models
-- ============================================
INSERT INTO category_ratings (model_id, category, elo, wins, losses, ties)
SELECT m.id, c.category, 1500, 0, 0, 0
FROM models m
CROSS JOIN (
    SELECT unnest(ARRAY['admet', 'optimization', 'notation']) as category
) c
ON CONFLICT (model_id, category) DO NOTHING;

-- ============================================
-- Update the leaderboard view
-- ============================================
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

-- Update the rating function for new categories
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

