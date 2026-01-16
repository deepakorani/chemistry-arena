'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { LeaderboardChart } from '@/components/LeaderboardChart';
import { ChemistryCategory, CATEGORIES } from '@/types';
import { api, LeaderboardEntry } from '@/lib/api';
import { TrendingUp, Filter, Download, Share2, BarChart3, AlertCircle, Loader2 } from 'lucide-react';

// Convert API response to the format expected by LeaderboardChart
function convertToModelStats(entries: LeaderboardEntry[]): any[] {
  return entries.map(entry => ({
    modelId: entry.model_id,
    modelName: entry.model_name,
    provider: entry.provider,
    category: 'admet' as ChemistryCategory,
    elo: entry.elo,
    wins: entry.wins,
    losses: entry.losses,
    ties: entry.ties,
    winRate: entry.win_rate,
    confidence: entry.confidence,
    totalMatches: entry.total_matches,
    isNew: entry.is_new,
  }));
}

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') as ChemistryCategory) || 'all';
  
  const [selectedCategory, setSelectedCategory] = useState<ChemistryCategory | 'all'>(
    CATEGORIES.find(c => c.id === initialCategory) ? initialCategory : 'all'
  );
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'elo' | 'winrate'>('elo');
  const [showAllModels, setShowAllModels] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBattles, setTotalBattles] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      if (selectedCategory === 'all') {
        response = await api.leaderboard.getOverall(100);
      } else {
        response = await api.leaderboard.getByCategory(selectedCategory, 100);
      }
      
      setLeaderboardData(convertToModelStats(response.entries));
      setTotalBattles(response.total_battles);
      setLastUpdated(new Date(response.last_updated));
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategory]);

  // Format relative time
  const getRelativeTime = (date: Date | null) => {
    if (!date) return 'Never';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-chem-primary" />
              Leaderboards
            </h1>
            <p className="text-chem-muted text-lg">
              Powered by real users. The most authentic chemistry AI benchmark.
            </p>
            {totalBattles > 0 && (
              <p className="text-chem-primary text-sm mt-2">
                {totalBattles.toLocaleString()} total battles recorded
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </motion.div>

      {/* Category Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
      >
        {/* All Categories Card */}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-xl text-center transition-all duration-300 ${
            selectedCategory === 'all'
              ? 'bg-chem-primary/20 border-2 border-chem-primary'
              : 'bg-chem-surface border border-chem-border hover:border-chem-primary/50'
          }`}
        >
          <div className="text-2xl mb-2">🔬</div>
          <div className="font-medium text-sm text-white">All</div>
        </button>
        
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`p-4 rounded-xl text-center transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-chem-primary/20 border-2 border-chem-primary'
                : 'bg-chem-surface border border-chem-border hover:border-chem-primary/50'
            }`}
          >
            <div className="text-2xl mb-2">{category.icon}</div>
            <div className="font-medium text-sm text-white truncate">
              {category.name.split(' ')[0]}
            </div>
          </button>
        ))}
      </motion.div>

      {/* Controls Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="inline-flex bg-chem-surface rounded-lg p-1">
            <button
              onClick={() => setViewMode('elo')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'elo'
                  ? 'bg-chem-primary text-chem-dark'
                  : 'text-chem-muted hover:text-white'
              }`}
            >
              Elo Rating
            </button>
            <button
              onClick={() => setViewMode('winrate')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'winrate'
                  ? 'bg-chem-primary text-chem-dark'
                  : 'text-chem-muted hover:text-white'
              }`}
            >
              Win Rate
            </button>
          </div>

          {/* Model Count Toggle */}
          <div className="inline-flex bg-chem-surface rounded-lg p-1">
            <button
              onClick={() => setShowAllModels(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showAllModels
                  ? 'bg-chem-primary text-chem-dark'
                  : 'text-chem-muted hover:text-white'
              }`}
            >
              Top 10
            </button>
            <button
              onClick={() => setShowAllModels(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showAllModels
                  ? 'bg-chem-primary text-chem-dark'
                  : 'text-chem-muted hover:text-white'
              }`}
            >
              All Models
            </button>
          </div>
        </div>

        <div className="text-sm text-chem-muted">
          Last updated: {getRelativeTime(lastUpdated)}
        </div>
      </motion.div>

      {/* Main Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass p-8 rounded-3xl"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-chem-primary animate-spin mb-4" />
            <p className="text-chem-muted">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-white font-medium mb-2">Failed to load leaderboard</p>
            <p className="text-chem-muted mb-4">{error}</p>
            <button onClick={fetchLeaderboard} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="w-12 h-12 text-chem-muted mb-4" />
            <p className="text-white font-medium mb-2">No data yet</p>
            <p className="text-chem-muted">Start battling in the Arena to populate the leaderboard!</p>
          </div>
        ) : (
          <LeaderboardChart
            data={showAllModels ? leaderboardData : leaderboardData.slice(0, 10)}
            category={selectedCategory}
            viewMode={viewMode}
          />
        )}
      </motion.div>

      {/* Methodology Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 glass p-6 rounded-2xl"
      >
        <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-chem-primary" />
          How Rankings Work
        </h3>
        <p className="text-chem-muted text-sm leading-relaxed">
          Rankings are calculated using the <span className="text-chem-primary">Bradley-Terry model</span>, 
          a statistical framework for pairwise comparisons. Each vote in the arena contributes to the 
          model&apos;s Elo rating. The algorithm iteratively estimates each model&apos;s &quot;strength&quot; until 
          convergence (threshold: 0.0001) or after 200 iterations. Models marked as &quot;New&quot; have 
          fewer than 50 evaluations and may see larger rating fluctuations.
        </p>
      </motion.div>
    </>
  );
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-chem-dark">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 text-chem-primary animate-spin mb-4" />
              <p className="text-chem-muted">Loading...</p>
            </div>
          }>
            <LeaderboardContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
