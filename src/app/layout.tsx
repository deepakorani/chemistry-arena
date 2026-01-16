import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chemistry Arena - AI Chemistry Benchmark',
  description: 'The world\'s first crowdsourced benchmark for AI chemistry capabilities. Compare LLMs on organic, inorganic, physical, analytical, biochemistry, and computational chemistry tasks.',
  keywords: ['AI', 'chemistry', 'benchmark', 'LLM', 'leaderboard', 'evaluation'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
