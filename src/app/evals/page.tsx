'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { CATEGORIES } from '@/types';
import { api, LeaderboardEntry } from '@/lib/api';
import { 
  FlaskConical, 
  Trophy,
  TrendingUp,
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface CategoryStats {
  id: string;
  name: string;
  icon: string;
  description: string;
  totalBattles: number;
  topModel: LeaderboardEntry | null;
  entries: LeaderboardEntry[];
}

export default function EvalsPage() {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategoryStats() {
      setIsLoading(true);
      setError(null);
      
      try {
        const stats: CategoryStats[] = [];
        
        for (const category of CATEGORIES) {
          try {
            const leaderboard = await api.leaderboard.getByCategory(category.id, 10);
            const topModel = leaderboard.entries.length > 0 ? leaderboard.entries[0] : null;
            const totalBattles = leaderboard.entries.reduce((sum, e) => sum + e.total_matches, 0) / 2;
            
            stats.push({
              id: category.id,
              name: category.name,
              icon: category.icon,
              description: category.description,
              totalBattles: Math.floor(totalBattles),
              topModel,
              entries: leaderboard.entries.slice(0, 5),
            });
          } catch (err) {
            // If category fails, add with empty data
            stats.push({
              id: category.id,
              name: category.name,
              icon: category.icon,
              description: category.description,
              totalBattles: 0,
              topModel: null,
              entries: [],
            });
          }
        }
        
        setCategoryStats(stats);
      } catch (err) {
        console.error('Failed to fetch category stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCategoryStats();
  }, []);

  const getWinRateColor = (rate: number) => {
    if (rate >= 0.6) return 'text-green-400';
    if (rate >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-chem-dark">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="font-display text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <FlaskConical className="w-10 h-10 text-chem-primary" />
              Category Stats
            </h1>
            <p className="text-chem-muted text-lg max-w-2xl">
              Win rates and top performers across different chemistry categories.
              Based on real arena battles and user votes.
            </p>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-chem-primary animate-spin mb-4" />
              <p className="text-chem-muted">Loading category statistics...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-white font-medium mb-2">Failed to load data</p>
              <p className="text-chem-muted">{error}</p>
            </div>
          )}

          {/* Category Stats Grid */}
          {!isLoading && !error && (
            <div className="grid md:grid-cols-2 gap-6">
              {categoryStats.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="glass p-6 rounded-2xl"
                >
                  {/* Category Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{category.icon}</span>
                      <div>
                        <h3 className="font-display font-bold text-white text-lg">
                          {category.name}
                        </h3>
                        <p className="text-sm text-chem-muted">{category.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-4 py-3 border-y border-chem-border">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-chem-muted" />
                      <span className="text-white font-mono">{category.totalBattles}</span>
                      <span className="text-chem-muted text-sm">battles</span>
                    </div>
                    
                    {category.topModel && (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-chem-primary font-medium">
                          {category.topModel.model_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Top Models */}
                  {category.entries.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-xs text-chem-muted uppercase tracking-wide mb-2">
                        Top Performers
                      </div>
                      {category.entries.map((entry, i) => (
                        <div 
                          key={entry.model_id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-chem-surface/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                              i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              i === 1 ? 'bg-gray-500/20 text-gray-300' :
                              i === 2 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-chem-surface text-chem-muted'
                            }`}>
                              {i + 1}
                            </span>
                            <span className="text-white text-sm">{entry.model_name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-mono text-sm ${getWinRateColor(entry.win_rate)}`}>
                              {(entry.win_rate * 100).toFixed(1)}%
                            </span>
                            <span className="text-chem-primary font-mono text-sm">
                              {entry.elo}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-chem-muted">
                      <p>No battles yet in this category</p>
                      <p className="text-sm mt-1">Start battling in the Arena!</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          {!isLoading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 glass p-6 rounded-2xl"
            >
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-chem-primary" />
                Overall Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-bold font-mono text-chem-primary">
                    {categoryStats.reduce((sum, c) => sum + c.totalBattles, 0)}
                  </div>
                  <div className="text-sm text-chem-muted">Total Battles</div>
                </div>
                <div>
                  <div className="text-3xl font-bold font-mono text-white">
                    {CATEGORIES.length}
                  </div>
                  <div className="text-sm text-chem-muted">Categories</div>
                </div>
                <div>
                  <div className="text-3xl font-bold font-mono text-white">
                    {new Set(categoryStats.flatMap(c => c.entries.map(e => e.model_id))).size}
                  </div>
                  <div className="text-sm text-chem-muted">Models Evaluated</div>
                </div>
                <div>
                  <div className="text-3xl font-bold font-mono text-green-400">
                    {categoryStats.filter(c => c.topModel).length}
                  </div>
                  <div className="text-sm text-chem-muted">Active Categories</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
