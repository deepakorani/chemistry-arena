# Chemistry Arena 🧪

The world's first crowdsourced benchmark for AI chemistry capabilities. Compare LLMs on organic, inorganic, physical, analytical, biochemistry, and computational chemistry tasks.

![Chemistry Arena](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## Features

- **🏆 Live Leaderboards** - Real-time rankings powered by Bradley-Terry statistical model
- **⚔️ Battle Arena** - Head-to-head anonymous model comparisons
- **📊 Micro Evals** - Granular evaluations of specific chemistry skills
- **🔬 6 Chemistry Categories** - Organic, Inorganic, Physical, Analytical, Biochemistry, Computational
- **📈 Elo Ratings** - Industry-standard rating system for pairwise comparisons

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chemistry-arena.git
cd chemistry-arena

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
chemistry-arena/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── leaderboard/       # Leaderboard page
│   │   ├── arena/             # Battle arena page
│   │   ├── methodology/       # Methodology page
│   │   └── evals/             # Micro evals page
│   ├── components/            # React components
│   │   ├── Navigation.tsx
│   │   ├── LeaderboardChart.tsx
│   │   ├── CategorySelector.tsx
│   │   └── BattleArena.tsx
│   ├── lib/                   # Utilities
│   │   └── bradley-terry.ts   # Bradley-Terry model implementation
│   ├── data/                  # Mock data
│   │   └── mock-data.ts
│   └── types/                 # TypeScript types
│       └── index.ts
├── public/                    # Static assets
├── tailwind.config.ts        # Tailwind configuration
└── package.json
```

## Bradley-Terry Model

The ranking system uses the Bradley-Terry model for pairwise comparisons:

```typescript
// Probability that model i beats model j
P(i > j) = pᵢ / (pᵢ + pⱼ)
```

Key features:
- Maximum likelihood estimation with iterative updates
- Convergence threshold: 0.0001
- Max iterations: 200
- Elo-style output centered at 1500

## Chemistry Categories

| Category | Description | Example Topics |
|----------|-------------|----------------|
| 🧪 Organic | Carbon compounds, reactions | Mechanisms, Synthesis, Stereochemistry |
| ⚗️ Inorganic | Metals, coordination | Crystal field, Bioinorganic |
| 📊 Physical | Thermodynamics, kinetics | Quantum, Statistical mechanics |
| 🔬 Analytical | Spectroscopy, analysis | NMR, Mass spec, Chromatography |
| 🧬 Biochemistry | Proteins, enzymes | Enzyme kinetics, Molecular biology |
| 💻 Computational | Modeling, simulations | DFT, Molecular dynamics |

## API Integration

To connect real LLM APIs, modify the `BattleArena` component:

```typescript
// Replace generateMockResponse with actual API calls
async function getModelResponse(modelId: string, prompt: string) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ modelId, prompt })
  });
  return response.json();
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Inspired by [Design Arena](https://designarena.ai) by Arcada Labs
- Bradley-Terry model for pairwise comparisons
- Chemistry education resources from various academic institutions

---

Built with ⚗️ by Chemistry Arena Team
