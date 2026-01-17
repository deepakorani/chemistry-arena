import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Chemistry-inspired palette
        'chem': {
          'dark': '#0f172a',       // Slate - more refined
          'darker': '#020617',     // Deeper slate  
          'navy': '#1e293b',
          'primary': '#10b981',    // Emerald - scientific, trustworthy
          'secondary': '#3b82f6',  // Blue - classic scientific
          'accent': '#f59e0b',     // Amber for gold medals
          'glow': '#34d399',       // Softer emerald hover
          'muted': '#94a3b8',      // Lighter muted (better readability)
          'surface': '#1e293b',    // Slate surface
          'border': '#334155',     // Slate border
        },
        // Element colors for different categories
        'element': {
          'organic': '#22c55e',
          'inorganic': '#3b82f6',
          'physical': '#a855f7',
          'analytical': '#ef4444',
          'biochem': '#f97316',
          'computational': '#06b6d4',
        }
      },
      fontFamily: {
        'display': ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-jetbrains)', 'Menlo', 'monospace'],
        'body': ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(to right, rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.03) 1px, transparent 1px)',
        'molecule-pattern': 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2310b981\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'3\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'orbit': 'orbit 20s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
