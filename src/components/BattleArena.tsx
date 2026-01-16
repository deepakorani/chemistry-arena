'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChemistryCategory, CATEGORIES } from '@/types';
import { api, BattleResponse, VoteResponse } from '@/lib/api';
import { RefreshCw, ChevronRight, ThumbsUp, Zap, Clock, Trophy, AlertCircle } from 'lucide-react';

interface BattleArenaProps {
  category?: ChemistryCategory;
}

export function BattleArena({ category }: BattleArenaProps) {
  const [currentBattle, setCurrentBattle] = useState<BattleResponse | null>(null);
  const [voteResult, setVoteResult] = useState<VoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<'A' | 'B' | 'tie' | null>(null);
  const [revealedModels, setRevealedModels] = useState(false);
  const [battleCount, setBattleCount] = useState(0);

  const startNewBattle = async () => {
    setIsLoading(true);
    setError(null);
    setHasVoted(false);
    setSelectedWinner(null);
    setRevealedModels(false);
    setVoteResult(null);
    
    try {
      const battle = await api.battles.create(category || undefined);
      setCurrentBattle(battle);
    } catch (err) {
      console.error('Failed to create battle:', err);
      setError(err instanceof Error ? err.message : 'Failed to create battle. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (winner: 'A' | 'B' | 'tie') => {
    if (!currentBattle) return;
    
    setSelectedWinner(winner);
    setHasVoted(true);
    
    try {
      // Generate a simple session ID for vote tracking
      const sessionId = localStorage.getItem('voter_session') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('voter_session', sessionId);
      
      const result = await api.battles.vote(currentBattle.id, winner, sessionId);
      setVoteResult(result);
      setRevealedModels(true);
      setBattleCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to submit vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
      // Revert vote state on error
      setHasVoted(false);
      setSelectedWinner(null);
    }
  };

  useEffect(() => {
    startNewBattle();
  }, [category]);

  const categoryInfo = currentBattle ? CATEGORIES.find(c => c.id === currentBattle.prompt_category) : null;

  // Error state
  if (error && !currentBattle) {
    return (
      <div className="glass p-8 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-white mb-2">Connection Error</h3>
        <p className="text-chem-muted mb-6">{error}</p>
        <p className="text-sm text-chem-muted mb-4">
          Make sure the Python backend is running on port 8000.
        </p>
        <button onClick={startNewBattle} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Battle Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-chem-primary" />
            Chemistry Battle
          </h2>
          <p className="text-chem-muted mt-1">
            Vote for the better response. Your choice powers the leaderboard.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-chem-muted">
            <Trophy className="w-4 h-4" />
            <span>{battleCount} battles completed</span>
          </div>
          <button
            onClick={startNewBattle}
            disabled={isLoading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            New Battle
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && currentBattle && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300">{error}</span>
        </div>
      )}

      {/* Prompt Card */}
      {currentBattle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{categoryInfo?.icon}</span>
            <div>
              <span className="text-chem-primary font-medium">{categoryInfo?.name}</span>
              <span className="mx-2 text-chem-muted">•</span>
              <span className="text-chem-muted capitalize">{currentBattle.prompt_difficulty} difficulty</span>
            </div>
          </div>
          <p className="text-white text-lg leading-relaxed">{currentBattle.prompt_text}</p>
        </motion.div>
      )}

      {/* Responses Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Response A */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`battle-card cursor-pointer ${
            selectedWinner === 'A' ? 'selected ring-2 ring-chem-primary' : ''
          } ${hasVoted && selectedWinner !== 'A' ? 'opacity-60' : ''}`}
          onClick={() => !hasVoted && !isLoading && currentBattle && handleVote('A')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                A
              </div>
              {revealedModels && voteResult && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="font-medium text-white">{voteResult.model_a_name}</span>
                </motion.div>
              )}
            </div>
            {selectedWinner === 'A' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-chem-primary"
              >
                <ThumbsUp className="w-5 h-5" />
                <span className="font-medium">Winner</span>
              </motion.div>
            )}
          </div>
          
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-chem-border rounded w-3/4" />
              <div className="h-4 bg-chem-border rounded w-full" />
              <div className="h-4 bg-chem-border rounded w-5/6" />
            </div>
          ) : currentBattle ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-body text-sm text-gray-300 leading-relaxed">
                {currentBattle.response_a}
              </pre>
            </div>
          ) : null}
        </motion.div>

        {/* Response B */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`battle-card cursor-pointer ${
            selectedWinner === 'B' ? 'selected ring-2 ring-chem-primary' : ''
          } ${hasVoted && selectedWinner !== 'B' ? 'opacity-60' : ''}`}
          onClick={() => !hasVoted && !isLoading && currentBattle && handleVote('B')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold">
                B
              </div>
              {revealedModels && voteResult && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="font-medium text-white">{voteResult.model_b_name}</span>
                </motion.div>
              )}
            </div>
            {selectedWinner === 'B' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-chem-primary"
              >
                <ThumbsUp className="w-5 h-5" />
                <span className="font-medium">Winner</span>
              </motion.div>
            )}
          </div>
          
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-chem-border rounded w-full" />
              <div className="h-4 bg-chem-border rounded w-2/3" />
              <div className="h-4 bg-chem-border rounded w-4/5" />
            </div>
          ) : currentBattle ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-body text-sm text-gray-300 leading-relaxed">
                {currentBattle.response_b}
              </pre>
            </div>
          ) : null}
        </motion.div>
      </div>

      {/* Voting Actions */}
      {!hasVoted && !isLoading && currentBattle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4"
        >
          <button
            onClick={() => handleVote('tie')}
            className="btn-secondary"
          >
            Both are equal (Tie)
          </button>
        </motion.div>
      )}

      {/* Post-Vote Actions */}
      {hasVoted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button onClick={startNewBattle} className="btn-primary flex items-center gap-2">
            Next Battle
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
