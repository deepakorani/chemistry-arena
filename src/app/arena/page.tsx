'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { BattleArena } from '@/components/BattleArena';
import { CategoryCard } from '@/components/CategorySelector';
import { ChemistryCategory, CATEGORIES } from '@/types';
import { Swords, Zap, Info } from 'lucide-react';

export default function ArenaPage() {
  const [selectedCategory, setSelectedCategory] = useState<ChemistryCategory | null>(null);

  return (
    <div className="min-h-screen bg-chem-dark">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chem-surface border border-chem-border mb-6">
              <Zap className="w-4 h-4 text-chem-primary animate-pulse" />
              <span className="text-sm text-chem-muted">Live Battle Mode</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
              <Swords className="w-12 h-12 text-chem-primary" />
              Chemistry Arena
            </h1>
            <p className="text-chem-muted text-lg max-w-2xl mx-auto">
              Compare AI models head-to-head on chemistry problems. 
              Your votes power the leaderboard and help identify the best models for chemistry tasks.
            </p>
          </motion.div>

          {/* Category Selection */}
          {!selectedCategory ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-display text-xl font-bold text-white mb-6 text-center">
                Choose a Category to Start
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {CATEGORIES.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className="glass p-6 rounded-2xl text-left hover:border-chem-primary/50 transition-all duration-300 group"
                  >
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-display font-bold text-white mb-2 group-hover:text-chem-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-chem-muted line-clamp-2">
                      {category.description}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Random Category Button */}
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
                    setSelectedCategory(randomCategory.id);
                  }}
                  className="btn-primary"
                >
                  🎲 Random Category
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Category Badge */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-chem-muted hover:text-white transition-colors text-sm"
                >
                  ← Change Category
                </button>
                <div className="px-4 py-2 rounded-full bg-chem-primary/20 text-chem-primary font-medium">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.icon}{' '}
                  {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                </div>
              </div>

              {/* Battle Arena */}
              <BattleArena category={selectedCategory} />
            </motion.div>
          )}

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 glass p-6 rounded-2xl max-w-3xl mx-auto"
          >
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-chem-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-bold text-white mb-2">How It Works</h3>
                <ul className="text-sm text-chem-muted space-y-2">
                  <li>• Two AI models receive the same chemistry prompt</li>
                  <li>• Model identities are hidden to prevent bias</li>
                  <li>• You vote for the better response (or tie)</li>
                  <li>• Your vote updates the Bradley-Terry ratings in real-time</li>
                  <li>• After voting, model identities are revealed</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
