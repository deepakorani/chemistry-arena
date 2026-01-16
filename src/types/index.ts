// Chemistry Arena Types

export type ChemistryCategory = 
  | 'admet'
  | 'optimization'
  | 'notation';

export interface Model {
  id: string;
  name: string;
  provider: string;
  logo?: string;
  description?: string;
  releaseDate?: string;
  isNew?: boolean;
}

export interface ModelStats {
  modelId: string;
  category: ChemistryCategory;
  elo: number;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
  confidence: number;
  totalMatches: number;
}

export interface Battle {
  id: string;
  timestamp: Date;
  category: ChemistryCategory;
  prompt: string;
  modelA: string;
  modelB: string;
  responseA: string;
  responseB: string;
  winner: 'A' | 'B' | 'tie' | null;
  voterId?: string;
}

export interface Prompt {
  id: string;
  category: ChemistryCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  expectedElements?: string[];
}

export interface LeaderboardEntry {
  rank: number;
  model: Model;
  stats: ModelStats;
  trend?: 'up' | 'down' | 'stable';
  rankChange?: number;
}

export interface BradleyTerryParams {
  models: string[];
  matchResults: MatchResult[];
  maxIterations?: number;
  convergenceThreshold?: number;
}

export interface MatchResult {
  modelA: string;
  modelB: string;
  winner: 'A' | 'B' | 'tie';
}

export interface BradleyTerryResult {
  ratings: Record<string, number>;
  iterations: number;
  converged: boolean;
}

export interface CategoryInfo {
  id: ChemistryCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  exampleTopics: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'admet',
    name: 'ADMET Prediction',
    description: 'Predict toxicity, lipophilicity, pKa, and solubility properties',
    icon: '🧬',
    color: 'element-admet',
    exampleTopics: ['Toxicity prediction', 'Lipophilicity (LogP)', 'pKa calculation', 'Aqueous solubility']
  },
  {
    id: 'optimization',
    name: 'Molecule Optimization',
    description: 'Design compounds with improved solubility, stability, and reduced toxicity',
    icon: '⚗️',
    color: 'element-optimization',
    exampleTopics: ['Solubility improvement', 'Metabolic stability', 'Toxicity reduction', 'Drug-likeness']
  },
  {
    id: 'notation',
    name: 'Notation Conversion',
    description: 'Convert between SMILES, IUPAC names, and other chemical notations',
    icon: '🔄',
    color: 'element-notation',
    exampleTopics: ['SMILES to IUPAC', 'IUPAC to SMILES', 'Common name to SMILES', 'Structure interpretation']
  }
];
