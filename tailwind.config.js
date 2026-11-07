/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0b0c0e',
          surface: '#111317',
          card: '#16181e',
          cardHover: '#1c1f26',
          border: 'rgba(255, 255, 255, 0.08)',
          borderStrong: 'rgba(255, 255, 255, 0.16)',
          accent: '#f97316',
          accentDark: '#ea580c',
          accentLight: '#fdba74',
          muted: '#71717a',
          emerald: '#10b981',
          sky: '#38bdf8',
          purple: '#8b5cf6',
          amber: '#f59e0b'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
      }
    }
  },
  plugins: []
};
