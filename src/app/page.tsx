'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { LeaderboardChart } from '@/components/LeaderboardChart';
import { CategorySelector } from '@/components/CategorySelector';
import { ChemistryCategory, CATEGORIES } from '@/types';
import { api, LeaderboardEntry } from '@/lib/api';
import { 
  Beaker, 
  Atom, 
  FlaskConical, 
  Microscope, 
  TrendingUp, 
  Users, 
  BarChart3,
  ArrowRight,
  Sparkles,
  Globe,
  Loader2
} from 'lucide-react';

// Convert API response to chart format
function convertToChartData(entries: LeaderboardEntry[]): any[] {
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

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<ChemistryCategory | 'all'>('all');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'elo' | 'winrate'>('elo');
  const [isLoading, setIsLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalModels, setTotalModels] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        let response;
        if (selectedCategory === 'all') {
          response = await api.leaderboard.getOverall(10);
        } else {
          response = await api.leaderboard.getByCategory(selectedCategory, 10);
        }
        setLeaderboardData(convertToChartData(response.entries));
        setTotalVotes(response.total_battles);
        setTotalModels(response.entries.length);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [selectedCategory]);

  // Dynamic stats from real data
  const stats = [
    { label: 'Total Votes', value: totalVotes > 0 ? totalVotes.toLocaleString() : '0', icon: Users },
    { label: 'Models Ranked', value: totalModels.toString(), icon: BarChart3 },
    { label: 'Categories', value: CATEGORIES.length.toString(), icon: FlaskConical },
    { label: 'Live Now', value: '🟢', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-chem-dark">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-molecule-animated hex-pattern" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-chem-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chem-secondary/10 rounded-full blur-3xl" />
        
        {/* Floating Atoms */}
        <div className="absolute top-40 left-20 opacity-20">
          <Atom className="w-24 h-24 text-chem-primary float-animation" />
        </div>
        <div className="absolute bottom-40 right-20 opacity-20">
          <Beaker className="w-20 h-20 text-chem-secondary float-animation-delayed" />
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chem-surface border border-chem-border mb-8">
              <Sparkles className="w-4 h-4 text-chem-primary" />
              <span className="text-sm text-chem-muted">Drug Discovery AI Benchmark</span>
            </div>
            
            {/* Title */}
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              LLM Performance
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-chem-primary via-chem-glow to-chem-secondary">
                Meets Chemistry
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-chem-muted max-w-2xl mx-auto mb-12">
              Each AI model is ranked using the Bradley-Terry rating system, 
              based on head-to-head chemistry task matchups voted by the community.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/arena" className="btn-primary flex items-center gap-2 text-lg">
                Start Voting
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/leaderboard" className="btn-secondary flex items-center gap-2 text-lg">
                View Leaderboard
                <TrendingUp className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
          
          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="glass p-6 rounded-2xl text-center"
              >
                <stat.icon className="w-8 h-8 text-chem-primary mx-auto mb-3" />
                <div className="font-display text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-chem-muted">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Leaderboard Preview Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Live Rankings
              </h2>
              <p className="text-chem-muted max-w-xl mx-auto">
                Powered entirely by real user votes. Rankings update in real-time 
                as the community evaluates AI models on chemistry tasks.
              </p>
            </div>

            {/* Category Selector */}
            <div className="flex justify-center mb-8">
              <CategorySelector
                selected={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center mb-8">
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
            </div>

            {/* Leaderboard Chart */}
            <div className="glass p-8 rounded-3xl">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-chem-primary animate-spin mb-4" />
                  <p className="text-chem-muted">Loading rankings...</p>
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="text-center py-16">
                  <BarChart3 className="w-12 h-12 text-chem-muted mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">No rankings yet</p>
                  <p className="text-chem-muted mb-4">Be the first to vote in the Arena!</p>
                  <Link href="/arena" className="btn-primary">
                    Start Voting
                  </Link>
                </div>
              ) : (
                <LeaderboardChart
                  data={leaderboardData}
                  category={selectedCategory}
                  viewMode={viewMode}
                />
              )}
            </div>

            {/* View Full Leaderboard CTA */}
            <div className="text-center mt-8">
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 text-chem-primary hover:text-chem-glow transition-colors"
              >
                View full leaderboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-chem-darker">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Evaluation Categories
              </h2>
              <p className="text-chem-muted max-w-xl mx-auto">
                Comprehensive evaluation across key drug discovery tasks
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {CATEGORIES.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link
                    href={`/leaderboard?category=${category.id}`}
                    className="block glass p-6 rounded-2xl hover:border-chem-primary/50 transition-all duration-300 group"
                  >
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-chem-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-chem-muted mb-4">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.exampleTopics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 text-xs rounded-full bg-chem-dark text-chem-muted"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Methodology Preview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass p-12 rounded-3xl text-center"
          >
            <Microscope className="w-16 h-16 text-chem-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Transparent Methodology
            </h2>
            <p className="text-chem-muted max-w-2xl mx-auto mb-8">
              Rankings are calculated using the Bradley-Terry model, a statistical framework 
              for pairwise comparison data. Each vote directly influences the leaderboard 
              through an iterative algorithm that converges to stable strength estimates.
            </p>
            <Link href="/methodology" className="btn-secondary">
              Learn More About Our Methodology
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-chem-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Beaker className="w-8 h-8 text-chem-primary" />
            <span className="font-display font-bold text-white">
              Chemistry<span className="text-chem-primary">Arena</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-chem-muted">
            <Link href="/methodology" className="hover:text-white transition-colors">
              Methodology
            </Link>
            <Link href="/evals" className="hover:text-white transition-colors">
              Category Stats
            </Link>
            <a href="mailto:contact@chemistryarena.ai" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <div className="text-sm text-chem-muted">
            © 2026 Chemistry Arena
          </div>
        </div>
      </footer>
    </div>
  );
}
