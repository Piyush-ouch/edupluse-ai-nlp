/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090B14',
        sidebar: '#0E1120',
        card: '#141829',
        'card-hover': '#1A2036',
        primary: '#8B5CF6',
        secondary: '#6366F1',
        positive: '#22C55E',
        negative: '#EF4444',
        warning: '#F59E0B',
        foreground: '#F8FAFC',
        muted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 24px -4px rgba(139, 92, 246, 0.35)',
        'glow-indigo': '0 0 24px -4px rgba(99, 102, 241, 0.3)',
        'card-dark': '0 10px 30px -6px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};

