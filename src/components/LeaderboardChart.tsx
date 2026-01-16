'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ModelStats, ChemistryCategory, CATEGORIES } from '@/types';
import { MODELS } from '@/data/mock-data';
import { Trophy, TrendingUp, Zap, ArrowUp, ArrowDown, Minus } from 'lucide-react';

// Extended stats interface that can include model name/provider from API
interface ExtendedModelStats extends ModelStats {
  modelName?: string;
  provider?: string;
  isNew?: boolean;
}

interface LeaderboardChartProps {
  data: ExtendedModelStats[];
  category: ChemistryCategory | 'all';
  viewMode: 'elo' | 'winrate';
}

const getProviderColor = (provider: string) => {
  const colors: Record<string, string> = {
    'OpenAI': '#10a37f',
    'Anthropic': '#d97706',
    'Google': '#4285f4',
    'DeepSeek': '#6366f1',
    'Meta': '#0668E1',
    'Mistral': '#ff7000',
    'Alibaba': '#ff6a00',
    'xAI': '#1DA1F2',
  };
  return colors[provider] || '#00d4aa';
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-400" />;
  if (rank === 2) return <Trophy className="w-4 h-4 text-gray-300" />;
  if (rank === 3) return <Trophy className="w-4 h-4 text-orange-400" />;
  return null;
};

const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
  if (trend === 'up') return <ArrowUp className="w-3 h-3 text-green-400" />;
  if (trend === 'down') return <ArrowDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-gray-400" />;
};

export function LeaderboardChart({ data, category, viewMode }: LeaderboardChartProps) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  
  const categoryInfo = CATEGORIES.find(c => c.id === category);
  
  const chartData = data.slice(0, 15).map((stats, index) => {
    // First check if model info is provided directly (from API)
    // Fall back to looking up from MODELS (for backward compatibility with mock data)
    const model = MODELS.find(m => m.id === stats.modelId);
    const name = stats.modelName || model?.name || stats.modelId;
    const provider = stats.provider || model?.provider || 'Unknown';
    const isNew = stats.isNew ?? model?.isNew ?? false;
    
    return {
      ...stats,
      name,
      provider,
      shortName: name.split(' ')[0] || stats.modelId,
      rank: index + 1,
      value: viewMode === 'elo' ? stats.elo : stats.winRate * 100,
      isNew,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="glass p-4 rounded-xl border border-chem-border shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-display font-bold text-white">{data.name}</span>
          {data.isNew && (
            <span className="px-2 py-0.5 text-xs bg-chem-primary/20 text-chem-primary rounded-full">
              NEW
            </span>
          )}
        </div>
        <div className="text-sm text-chem-muted">{data.provider}</div>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between gap-8">
            <span className="text-chem-muted">Elo Rating:</span>
            <span className="font-mono text-chem-primary font-bold">{data.elo}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-chem-muted">Win Rate:</span>
            <span className="font-mono text-white">{(data.winRate * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-chem-muted">Matches:</span>
            <span className="font-mono text-white">{data.totalMatches}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
            {category === 'all' ? 'Overall Rankings' : categoryInfo?.name}
            {categoryInfo && <span className="text-2xl">{categoryInfo.icon}</span>}
          </h3>
          <p className="text-chem-muted text-sm mt-1">
            {category === 'all' 
              ? 'Aggregated across all chemistry categories'
              : categoryInfo?.description}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-chem-primary" />
          <span className="text-chem-muted">Live Rankings</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
          >
            <XAxis
              type="number"
              domain={viewMode === 'elo' ? [1300, 1700] : [40, 70]}
              tick={{ fill: '#4a5568', fontSize: 12 }}
              axisLine={{ stroke: '#2d3748' }}
              tickLine={{ stroke: '#2d3748' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#e2e8f0', fontSize: 13 }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 212, 170, 0.05)' }} />
            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              onMouseEnter={(data) => setHoveredModel(data.modelId)}
              onMouseLeave={() => setHoveredModel(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.modelId}
                  fill={getProviderColor(entry.provider)}
                  opacity={hoveredModel === null || hoveredModel === entry.modelId ? 1 : 0.4}
                  style={{ transition: 'opacity 0.2s' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-chem-muted text-sm border-b border-chem-border">
              <th className="text-left py-3 px-4">Rank</th>
              <th className="text-left py-3 px-4">Model</th>
              <th className="text-right py-3 px-4">Elo</th>
              <th className="text-right py-3 px-4">Win Rate</th>
              <th className="text-right py-3 px-4">W/L/T</th>
              <th className="text-right py-3 px-4">Matches</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((entry, index) => (
              <tr
                key={entry.modelId}
                className="leaderboard-row border-b border-chem-border/50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`rank-badge ${index < 3 ? `rank-${index + 1}` : 'bg-chem-surface'}`}>
                      {index + 1}
                    </div>
                    {getRankIcon(index + 1)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getProviderColor(entry.provider) }}
                    />
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {entry.name}
                        {entry.isNew && (
                          <span className="px-2 py-0.5 text-xs bg-chem-primary/20 text-chem-primary rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-chem-muted">{entry.provider}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-mono font-bold text-chem-primary">{entry.elo}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${entry.winRate * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-sm w-12 text-right">
                      {(entry.winRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-mono text-sm text-chem-muted">
                    <span className="text-green-400">{entry.wins}</span>/
                    <span className="text-red-400">{entry.losses}</span>/
                    <span className="text-gray-400">{entry.ties}</span>
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="font-mono text-sm">{entry.totalMatches}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
