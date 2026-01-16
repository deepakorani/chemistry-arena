'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { 
  BookOpen, 
  BarChart3, 
  Users, 
  Shield, 
  GitBranch,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Code
} from 'lucide-react';
import Link from 'next/link';

export default function MethodologyPage() {
  const sections = [
    {
      icon: BarChart3,
      title: 'Bradley-Terry Model',
      content: `The Bradley-Terry model is a probability model that predicts the outcome of pairwise comparisons. For any two models i and j, the probability that i beats j is:

P(i > j) = pᵢ / (pᵢ + pⱼ)

where pᵢ and pⱼ are the "strength" parameters. We use maximum likelihood estimation with iterative updates to find optimal strength estimates.

The algorithm converges when strength estimates stabilize (threshold: 0.0001) or after 200 iterations. Final ratings are converted to an Elo-style scale centered at 1500.`,
    },
    {
      icon: GitBranch,
      title: 'Tournament Structure',
      content: `Each voting session follows a structured tournament:

1. A prompt is randomly selected from the category pool
2. Four distinct models are chosen from the active model pool
3. All models receive identical prompts with temperature 0.8
4. The first two models to complete are presented anonymously
5. Users vote on the better response
6. Winners face winners, losers face losers
7. This creates 5 pairwise comparisons per session

Each comparison feeds directly into the Bradley-Terry calculations.`,
    },
    {
      icon: Shield,
      title: 'Anonymization & Fairness',
      content: `To ensure unbiased evaluation:

• Model identities are hidden throughout voting
• Responses are presented in randomized order (left/right)
• No identifying information is included in prompts
• Model configurations are standardized where possible
• All methodologies are publicly documented

Models are revealed only after voting to prevent brand bias.`,
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      content: `Rankings update continuously as votes come in:

• Each vote immediately affects the leaderboard
• Bradley-Terry recalculation happens in real-time
• New models appear with "New" status until 50+ comparisons
• Confidence intervals shrink as more data accumulates
• Historical data is preserved for trend analysis`,
    },
  ];

  const codeExample = `// Bradley-Terry probability calculation
function predictWinProbability(ratingA: number, ratingB: number): number {
  // Convert Elo ratings to win probability
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Example: Model A (Elo 1600) vs Model B (Elo 1500)
const probability = predictWinProbability(1600, 1500);
// Result: 0.64 (64% chance A wins)`;

  return (
    <div className="min-h-screen bg-chem-dark">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chem-surface border border-chem-border mb-6">
              <BookOpen className="w-4 h-4 text-chem-primary" />
              <span className="text-sm text-chem-muted">Transparent & Open</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Methodology
            </h1>
            <p className="text-chem-muted text-lg max-w-2xl mx-auto">
              A subjective framework for evaluating AI chemistry capabilities. 
              Community preferences shape the rankings through rigorous statistical methods.
            </p>
          </motion.div>

          {/* Key Principles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-6 mb-16"
          >
            {[
              { icon: Users, label: 'Community-Driven', desc: 'Rankings from real user votes' },
              { icon: BarChart3, label: 'Statistically Rigorous', desc: 'Bradley-Terry pairwise model' },
              { icon: Shield, label: 'Bias-Free', desc: 'Anonymous model evaluation' },
            ].map((item, i) => (
              <div key={item.label} className="glass p-6 rounded-2xl text-center">
                <item.icon className="w-10 h-10 text-chem-primary mx-auto mb-4" />
                <h3 className="font-display font-bold text-white mb-2">{item.label}</h3>
                <p className="text-sm text-chem-muted">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Detailed Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="glass p-8 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <section.icon className="w-6 h-6 text-chem-primary" />
                  <h2 className="font-display text-xl font-bold text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="text-chem-muted whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Code Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 glass p-8 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-6 h-6 text-chem-primary" />
              <h2 className="font-display text-xl font-bold text-white">
                Implementation Example
              </h2>
            </div>
            <pre className="bg-chem-darker p-6 rounded-xl overflow-x-auto">
              <code className="text-sm text-gray-300 font-mono">{codeExample}</code>
            </pre>
          </motion.div>

          {/* Limitations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 glass p-8 rounded-2xl border-l-4 border-chem-accent"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-chem-accent" />
              <h2 className="font-display text-xl font-bold text-white">
                Limitations & Considerations
              </h2>
            </div>
            <ul className="space-y-3 text-chem-muted">
              <li className="flex items-start gap-2">
                <span className="text-chem-accent mt-1">•</span>
                Rankings reflect subjective human preferences, not objective correctness
              </li>
              <li className="flex items-start gap-2">
                <span className="text-chem-accent mt-1">•</span>
                Models with fewer comparisons have higher rating uncertainty
              </li>
              <li className="flex items-start gap-2">
                <span className="text-chem-accent mt-1">•</span>
                Prompt selection and phrasing can influence model performance
              </li>
              <li className="flex items-start gap-2">
                <span className="text-chem-accent mt-1">•</span>
                Voter expertise varies; chemistry experts may evaluate differently than novices
              </li>
              <li className="flex items-start gap-2">
                <span className="text-chem-accent mt-1">•</span>
                Model versions are updated regularly; historical comparisons may not reflect current capabilities
              </li>
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <h3 className="font-display text-2xl font-bold text-white mb-4">
              Ready to contribute?
            </h3>
            <p className="text-chem-muted mb-8">
              Your votes help build the most authentic chemistry AI benchmark.
            </p>
            <Link href="/arena" className="btn-primary inline-flex items-center gap-2">
              Start Voting
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-12 text-center text-sm text-chem-muted"
          >
            Questions about our methodology? Reach us at{' '}
            <a href="mailto:contact@chemistryarena.ai" className="text-chem-primary hover:underline">
              contact@chemistryarena.ai
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
