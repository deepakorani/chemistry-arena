/**
 * Bradley-Terry Model Implementation
 * 
 * The Bradley-Terry model is a probability model for pairwise comparisons.
 * It estimates the "strength" of each competitor based on win/loss records.
 * 
 * For models i and j, the probability that i beats j is:
 * P(i > j) = p_i / (p_i + p_j)
 * 
 * where p_i and p_j are the strength parameters.
 * 
 * We use maximum likelihood estimation with iterative updates
 * to find the optimal strength parameters.
 */

import { BradleyTerryParams, BradleyTerryResult, MatchResult } from '@/types';

export class BradleyTerryModel {
  private models: string[];
  private matchResults: MatchResult[];
  private maxIterations: number;
  private convergenceThreshold: number;

  constructor(params: BradleyTerryParams) {
    this.models = params.models;
    this.matchResults = params.matchResults;
    this.maxIterations = params.maxIterations ?? 200;
    this.convergenceThreshold = params.convergenceThreshold ?? 0.0001;
  }

  /**
   * Compute win counts for each model against each other model
   */
  private computeWinMatrix(): Map<string, Map<string, number>> {
    const winMatrix = new Map<string, Map<string, number>>();

    // Initialize matrix
    for (const model of this.models) {
      winMatrix.set(model, new Map());
      for (const other of this.models) {
        winMatrix.get(model)!.set(other, 0);
      }
    }

    // Count wins
    for (const match of this.matchResults) {
      if (match.winner === 'A') {
        const current = winMatrix.get(match.modelA)!.get(match.modelB)!;
        winMatrix.get(match.modelA)!.set(match.modelB, current + 1);
      } else if (match.winner === 'B') {
        const current = winMatrix.get(match.modelB)!.get(match.modelA)!;
        winMatrix.get(match.modelB)!.set(match.modelA, current + 1);
      } else {
        // Tie: count as 0.5 win for each
        const currentA = winMatrix.get(match.modelA)!.get(match.modelB)!;
        const currentB = winMatrix.get(match.modelB)!.get(match.modelA)!;
        winMatrix.get(match.modelA)!.set(match.modelB, currentA + 0.5);
        winMatrix.get(match.modelB)!.set(match.modelA, currentB + 0.5);
      }
    }

    return winMatrix;
  }

  /**
   * Compute total number of comparisons between each pair
   */
  private computeComparisonCounts(): Map<string, Map<string, number>> {
    const counts = new Map<string, Map<string, number>>();

    for (const model of this.models) {
      counts.set(model, new Map());
      for (const other of this.models) {
        counts.get(model)!.set(other, 0);
      }
    }

    for (const match of this.matchResults) {
      const countA = counts.get(match.modelA)!.get(match.modelB)!;
      const countB = counts.get(match.modelB)!.get(match.modelA)!;
      counts.get(match.modelA)!.set(match.modelB, countA + 1);
      counts.get(match.modelB)!.set(match.modelA, countB + 1);
    }

    return counts;
  }

  /**
   * Run the Bradley-Terry estimation algorithm
   */
  public estimate(): BradleyTerryResult {
    const winMatrix = this.computeWinMatrix();
    const comparisonCounts = this.computeComparisonCounts();

    // Initialize all ratings to 1
    const ratings: Record<string, number> = {};
    for (const model of this.models) {
      ratings[model] = 1.0;
    }

    let iteration = 0;
    let converged = false;

    while (iteration < this.maxIterations && !converged) {
      const newRatings: Record<string, number> = {};
      let maxChange = 0;

      for (const model of this.models) {
        // Compute total wins for this model
        let totalWins = 0;
        for (const other of this.models) {
          if (other !== model) {
            totalWins += winMatrix.get(model)!.get(other)!;
          }
        }

        // Compute denominator sum
        let denomSum = 0;
        for (const other of this.models) {
          if (other !== model) {
            const nComparisons = comparisonCounts.get(model)!.get(other)!;
            if (nComparisons > 0) {
              denomSum += nComparisons / (ratings[model] + ratings[other]);
            }
          }
        }

        // Update rating
        if (denomSum > 0) {
          newRatings[model] = totalWins / denomSum;
        } else {
          newRatings[model] = ratings[model];
        }

        // Track convergence
        const change = Math.abs(newRatings[model] - ratings[model]);
        if (change > maxChange) {
          maxChange = change;
        }
      }

      // Normalize ratings (sum to number of models)
      const ratingSum = Object.values(newRatings).reduce((a, b) => a + b, 0);
      const normFactor = this.models.length / ratingSum;
      for (const model of this.models) {
        ratings[model] = newRatings[model] * normFactor;
      }

      iteration++;
      converged = maxChange < this.convergenceThreshold;
    }

    // Convert to Elo-style ratings (centered at 1500)
    const eloRatings: Record<string, number> = {};
    const baseElo = 1500;
    const scaleFactor = 400;

    // Use geometric mean as reference
    const logSum = Object.values(ratings).reduce((sum, r) => sum + Math.log(r), 0);
    const logMean = logSum / this.models.length;
    const referencePower = Math.exp(logMean);

    for (const model of this.models) {
      eloRatings[model] = Math.round(
        baseElo + scaleFactor * Math.log10(ratings[model] / referencePower)
      );
    }

    return {
      ratings: eloRatings,
      iterations: iteration,
      converged,
    };
  }

  /**
   * Predict win probability between two models
   */
  public predictWinProbability(
    ratings: Record<string, number>,
    modelA: string,
    modelB: string
  ): number {
    const ratingA = ratings[modelA];
    const ratingB = ratings[modelB];
    
    // Convert Elo back to probability
    const expectedScore = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    return expectedScore;
  }

  /**
   * Calculate confidence interval based on number of matches
   */
  public calculateConfidence(modelId: string): number {
    let totalMatches = 0;
    for (const match of this.matchResults) {
      if (match.modelA === modelId || match.modelB === modelId) {
        totalMatches++;
      }
    }
    
    // Simple confidence based on sample size
    // Full confidence at 100+ matches
    return Math.min(1, totalMatches / 100);
  }
}

/**
 * Utility function to calculate win rate from match results
 */
export function calculateWinRate(
  modelId: string,
  matchResults: MatchResult[]
): { wins: number; losses: number; ties: number; winRate: number } {
  let wins = 0;
  let losses = 0;
  let ties = 0;

  for (const match of matchResults) {
    if (match.modelA === modelId) {
      if (match.winner === 'A') wins++;
      else if (match.winner === 'B') losses++;
      else ties++;
    } else if (match.modelB === modelId) {
      if (match.winner === 'B') wins++;
      else if (match.winner === 'A') losses++;
      else ties++;
    }
  }

  const total = wins + losses + ties;
  const winRate = total > 0 ? (wins + ties * 0.5) / total : 0;

  return { wins, losses, ties, winRate };
}

/**
 * Generate mock match data for demonstration
 */
export function generateMockMatches(
  models: string[],
  count: number,
  biases?: Record<string, number>
): MatchResult[] {
  const results: MatchResult[] = [];
  const defaultBias = biases ?? {};

  for (let i = 0; i < count; i++) {
    // Pick two random different models
    const modelAIndex = Math.floor(Math.random() * models.length);
    let modelBIndex = Math.floor(Math.random() * models.length);
    while (modelBIndex === modelAIndex) {
      modelBIndex = Math.floor(Math.random() * models.length);
    }

    const modelA = models[modelAIndex];
    const modelB = models[modelBIndex];

    // Determine winner based on biases
    const biasA = defaultBias[modelA] ?? 1;
    const biasB = defaultBias[modelB] ?? 1;
    const probA = biasA / (biasA + biasB);

    const rand = Math.random();
    let winner: 'A' | 'B' | 'tie';
    
    if (rand < 0.05) {
      winner = 'tie';
    } else if (rand < probA) {
      winner = 'A';
    } else {
      winner = 'B';
    }

    results.push({ modelA, modelB, winner });
  }

  return results;
}
