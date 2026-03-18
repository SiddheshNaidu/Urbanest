/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-dark': '#0B0B0B',
        sidebar: '#070707',
        surface: '#121212',
        'surface-hover': '#18181B',
        'surface-2': '#1E1E24',
        gold: '#EAB308',
        'gold-light': '#FBBF24',
        'gold-dim': 'rgba(234,179,8,0.1)',
        muted: '#A1A1AA',
        'muted-2': '#71717A',
        'border-dark': '#27272A',
        emerald: '#10B981',
        crimson: '#EF4444',
        amber: '#F59E0B'
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
