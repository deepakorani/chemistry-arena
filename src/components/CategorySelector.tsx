'use client';

import { ChemistryCategory, CATEGORIES } from '@/types';
import { motion } from 'framer-motion';

interface CategorySelectorProps {
  selected: ChemistryCategory | 'all';
  onChange: (category: ChemistryCategory | 'all') => void;
}

export function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('all')}
        className={`category-pill ${selected === 'all' ? 'active' : 'text-chem-muted hover:text-white'}`}
      >
        <span className="mr-2">🔬</span>
        All Categories
      </button>
      
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`category-pill ${selected === category.id ? 'active' : 'text-chem-muted hover:text-white'}`}
        >
          <span className="mr-2">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
}

interface CategoryCardProps {
  category: typeof CATEGORIES[number];
  isSelected: boolean;
  onClick: () => void;
  stats?: {
    totalVotes: number;
    topModel: string;
  };
}

export function CategoryCard({ category, isSelected, onClick, stats }: CategoryCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-6 rounded-2xl text-left w-full transition-all duration-300 ${
        isSelected
          ? 'bg-chem-primary/10 border-2 border-chem-primary shadow-lg shadow-chem-primary/20'
          : 'bg-chem-surface border border-chem-border hover:border-chem-primary/30'
      }`}
    >
      {/* Icon */}
      <div className="text-4xl mb-4">{category.icon}</div>
      
      {/* Title */}
      <h3 className="font-display font-bold text-lg text-white mb-2">
        {category.name}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-chem-muted mb-4 line-clamp-2">
        {category.description}
      </p>
      
      {/* Topics */}
      <div className="flex flex-wrap gap-1">
        {category.exampleTopics.slice(0, 3).map((topic) => (
          <span
            key={topic}
            className="px-2 py-1 text-xs rounded-full bg-chem-dark/50 text-chem-muted"
          >
            {topic}
          </span>
        ))}
      </div>
      
      {/* Stats */}
      {stats && (
        <div className="mt-4 pt-4 border-t border-chem-border/50">
          <div className="flex justify-between text-xs">
            <span className="text-chem-muted">{stats.totalVotes.toLocaleString()} votes</span>
            <span className="text-chem-primary">#{1} {stats.topModel}</span>
          </div>
        </div>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-3 h-3 bg-chem-primary rounded-full animate-pulse" />
      )}
    </motion.button>
  );
}
