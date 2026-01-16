import { Model, Prompt, ChemistryCategory, ModelStats, MatchResult } from '@/types';
import { BradleyTerryModel, calculateWinRate, generateMockMatches } from '@/lib/bradley-terry';

// Available LLM models for chemistry benchmarking
export const MODELS: Model[] = [
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    description: 'Latest GPT model with enhanced reasoning',
    isNew: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Optimized multimodal GPT-4',
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    description: 'Most capable Claude model',
    isNew: true,
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    description: 'Balanced performance and speed',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: 'Advanced reasoning model',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Fast and efficient',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    description: 'Reasoning-focused model',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'General purpose model',
  },
  {
    id: 'llama-4-405b',
    name: 'Llama 4 405B',
    provider: 'Meta',
    description: 'Largest Llama model',
    isNew: true,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large 2',
    provider: 'Mistral',
    description: 'Flagship Mistral model',
  },
  {
    id: 'qwen-max',
    name: 'Qwen Max',
    provider: 'Alibaba',
    description: 'Leading Chinese LLM',
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    description: 'xAI flagship model',
    isNew: true,
  },
];

// Sample chemistry prompts by category
export const PROMPTS: Prompt[] = [
  // Organic Chemistry
  {
    id: 'org-1',
    category: 'organic',
    difficulty: 'medium',
    text: 'Propose a retrosynthetic analysis for the synthesis of ibuprofen from benzene. Include all key disconnections and suggest appropriate reagents for each forward step.',
  },
  {
    id: 'org-2',
    category: 'organic',
    difficulty: 'hard',
    text: 'Explain the mechanism of the Diels-Alder reaction between 1,3-butadiene and maleic anhydride. Discuss the stereochemistry, endo/exo selectivity, and frontier molecular orbital theory.',
  },
  {
    id: 'org-3',
    category: 'organic',
    difficulty: 'medium',
    text: 'Compare and contrast SN1 and SN2 reaction mechanisms. Provide examples and discuss factors that favor each pathway.',
  },
  
  // Inorganic Chemistry
  {
    id: 'inorg-1',
    category: 'inorganic',
    difficulty: 'hard',
    text: 'Using crystal field theory, explain why [Co(NH3)6]³⁺ is diamagnetic while [CoF6]³⁻ is paramagnetic. Calculate the crystal field splitting energy for each complex.',
  },
  {
    id: 'inorg-2',
    category: 'inorganic',
    difficulty: 'medium',
    text: 'Describe the bonding in ferrocene using molecular orbital theory. Explain why it exhibits aromatic character.',
  },
  
  // Physical Chemistry
  {
    id: 'phys-1',
    category: 'physical',
    difficulty: 'hard',
    text: 'Derive the Michaelis-Menten equation from first principles. Explain the significance of Km and Vmax and how they can be determined experimentally using Lineweaver-Burk plots.',
  },
  {
    id: 'phys-2',
    category: 'physical',
    difficulty: 'medium',
    text: 'Calculate the equilibrium constant for the reaction 2NO₂(g) ⇌ N₂O₄(g) at 25°C given ΔG° = -4.7 kJ/mol. Explain how temperature affects this equilibrium.',
  },
  
  // Analytical Chemistry
  {
    id: 'anal-1',
    category: 'analytical',
    difficulty: 'medium',
    text: 'Interpret the following ¹H NMR spectrum: A compound C₈H₁₀O shows peaks at δ 7.2 (5H, m), δ 3.6 (2H, t), δ 2.8 (2H, t), and δ 2.1 (1H, br s, D₂O exchangeable). Propose a structure.',
  },
  {
    id: 'anal-2',
    category: 'analytical',
    difficulty: 'hard',
    text: 'Design an HPLC method for separating a mixture of caffeine, aspirin, and acetaminophen. Specify column type, mobile phase, detection method, and expected retention order.',
  },
  
  // Biochemistry
  {
    id: 'biochem-1',
    category: 'biochemistry',
    difficulty: 'medium',
    text: 'Explain the complete mechanism of ATP synthesis in mitochondria, including the electron transport chain and chemiosmotic coupling.',
  },
  {
    id: 'biochem-2',
    category: 'biochemistry',
    difficulty: 'hard',
    text: 'Describe the mechanism of DNA replication in E. coli, including the roles of all major enzymes involved. Explain how proofreading maintains fidelity.',
  },
  
  // Computational Chemistry
  {
    id: 'comp-1',
    category: 'computational',
    difficulty: 'hard',
    text: 'Compare DFT functionals (B3LYP, M06-2X, ωB97X-D) for calculating the barrier height of a hydrogen atom transfer reaction. Discuss accuracy vs computational cost trade-offs.',
  },
  {
    id: 'comp-2',
    category: 'computational',
    difficulty: 'medium',
    text: 'Explain how molecular dynamics simulations can be used to study protein folding. Discuss force field selection and simulation timescale considerations.',
  },
];

// Model performance biases (simulated "true" skill levels)
const MODEL_BIASES: Record<string, number> = {
  'gpt-5': 1.8,
  'claude-opus-4': 1.75,
  'gemini-2.5-pro': 1.5,
  'gpt-4o': 1.4,
  'claude-sonnet-4': 1.35,
  'deepseek-r1': 1.3,
  'llama-4-405b': 1.25,
  'grok-3': 1.2,
  'mistral-large': 1.15,
  'gemini-2.5-flash': 1.1,
  'qwen-max': 1.05,
  'deepseek-v3': 1.0,
};

// Generate mock match results for each category
export function generateCategoryMatches(category: ChemistryCategory): MatchResult[] {
  const modelIds = MODELS.map(m => m.id);
  
  // Category-specific biases (some models perform better in certain areas)
  const categoryBiases: Record<string, number> = { ...MODEL_BIASES };
  
  switch (category) {
    case 'computational':
      categoryBiases['deepseek-r1'] *= 1.3; // DeepSeek excels at reasoning
      categoryBiases['claude-opus-4'] *= 1.2;
      break;
    case 'organic':
      categoryBiases['gpt-5'] *= 1.2;
      categoryBiases['claude-opus-4'] *= 1.15;
      break;
    case 'biochemistry':
      categoryBiases['gemini-2.5-pro'] *= 1.2;
      categoryBiases['gpt-5'] *= 1.1;
      break;
    case 'analytical':
      categoryBiases['claude-sonnet-4'] *= 1.2;
      break;
    case 'physical':
      categoryBiases['deepseek-r1'] *= 1.25;
      break;
    case 'inorganic':
      categoryBiases['gpt-4o'] *= 1.15;
      break;
  }
  
  return generateMockMatches(modelIds, 500 + Math.floor(Math.random() * 200), categoryBiases);
}

// Calculate leaderboard stats for a category
export function calculateLeaderboardStats(category: ChemistryCategory): ModelStats[] {
  const matches = generateCategoryMatches(category);
  const modelIds = MODELS.map(m => m.id);
  
  const btModel = new BradleyTerryModel({
    models: modelIds,
    matchResults: matches,
  });
  
  const result = btModel.estimate();
  
  return modelIds.map(modelId => {
    const winStats = calculateWinRate(modelId, matches);
    return {
      modelId,
      category,
      elo: result.ratings[modelId],
      wins: winStats.wins,
      losses: winStats.losses,
      ties: winStats.ties,
      winRate: winStats.winRate,
      confidence: btModel.calculateConfidence(modelId),
      totalMatches: winStats.wins + winStats.losses + winStats.ties,
    };
  }).sort((a, b) => b.elo - a.elo);
}

// Get all leaderboard data
export function getAllLeaderboardData(): Record<ChemistryCategory, ModelStats[]> {
  const categories: ChemistryCategory[] = [
    'organic', 'inorganic', 'physical', 'analytical', 'biochemistry', 'computational'
  ];
  
  const data: Partial<Record<ChemistryCategory, ModelStats[]>> = {};
  
  for (const category of categories) {
    data[category] = calculateLeaderboardStats(category);
  }
  
  return data as Record<ChemistryCategory, ModelStats[]>;
}

// Get overall rankings (averaged across categories)
export function getOverallRankings(): ModelStats[] {
  const allData = getAllLeaderboardData();
  const modelIds = MODELS.map(m => m.id);
  
  return modelIds.map(modelId => {
    const categoryStats = Object.values(allData)
      .map(stats => stats.find(s => s.modelId === modelId)!)
      .filter(Boolean);
    
    const avgElo = categoryStats.reduce((sum, s) => sum + s.elo, 0) / categoryStats.length;
    const totalWins = categoryStats.reduce((sum, s) => sum + s.wins, 0);
    const totalLosses = categoryStats.reduce((sum, s) => sum + s.losses, 0);
    const totalTies = categoryStats.reduce((sum, s) => sum + s.ties, 0);
    const totalMatches = totalWins + totalLosses + totalTies;
    
    return {
      modelId,
      category: 'organic' as ChemistryCategory, // placeholder
      elo: Math.round(avgElo),
      wins: totalWins,
      losses: totalLosses,
      ties: totalTies,
      winRate: totalMatches > 0 ? (totalWins + totalTies * 0.5) / totalMatches : 0,
      confidence: Math.min(1, totalMatches / 600),
      totalMatches,
    };
  }).sort((a, b) => b.elo - a.elo);
}
