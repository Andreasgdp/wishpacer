import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#041A10',
          950: '#021008',
          900: '#041A10', // Deep forest canvas
          850: '#062114', // Alternative rich deep forest
          800: '#092A1B',
          700: '#0E3D28',
          600: '#155237',
          500: '#1E6B4A',
          400: '#2C8760',
        },
        momentum: {
          DEFAULT: '#22C55E',
          neon: '#22C55E',
          emerald: '#10B981',
          glow: '#34D399',
          light: '#4ADE80',
          dark: '#15803D',
        },
        earth: {
          terracotta: '#C16C4B',
          mustard: '#DDA05E',
          amber: '#D97706',
          ochre: '#B48B53',
        },
        brand: {
          50: '#F2F8F5',
          100: '#DFEEE7',
          200: '#C3DDD0',
          300: '#96C6B0',
          400: '#6AA88F',
          500: '#2E8767',
          600: '#177251', // Dark mode primary
          700: '#165C42',
          800: '#124733',
          900: '#064E3B', // Light mode primary (Original Emerald Ink)
          950: '#062015',
        },
        champagne: {
          DEFAULT: '#F8E7C9',
          50: '#FDFBF7',
          100: '#FBF1E5',
          200: '#F8E9D4',
          300: '#F1DDBC',
          400: '#EACFA4',
          500: '#E3BB87',
          600: '#DEAB72',
          700: '#F8E7C9', // Original Champagne
          800: '#B48B53',
          900: '#A38354',
          950: '#3A1F0D',
        },
        cream: {
          50: '#FAF8F5',
          100: '#F5F1E8',
          200: '#EFECE3',
          300: '#E5DFD1',
          400: '#D5CBB9',
          500: '#C2B59F',
        },
        obsidian: {
          DEFAULT: '#0B0E11',
          950: '#070A0C',
          900: '#0B0E11', // Canvas base
          850: '#0E1216',
          800: '#12161A', // Card surface
          700: '#181D21', // Elevated cockpit
          600: '#21262D', // Primary border
          500: '#30363D', // Subtle border
          400: '#484F58',
          300: '#8B949E',
          200: '#C9D1D9',
          100: '#E6EDF3',
        },
        sage: {
          DEFAULT: '#CCD7D0',
          50: '#F5F8F6',
          100: '#E8EFEA',
          200: '#DDE6DF',
          300: '#CCD7D0', // Canvas base
          400: '#B8C5BC',
          500: '#A8B6AC', // Border
          600: '#6B7F72',
          700: '#425448',
          800: '#28362D',
          900: '#111714', // Primary text
        },
        onyx: {
          DEFAULT: '#2A2A2A',
          700: '#42474C',
          800: '#33373B',
          900: '#2A2A2A', // Dark mode Global & Card BG
          950: '#1E1E1E',
        },
        ash: {
          200: '#DBE7CF', // Dark mode secondary text
          300: '#C5D4B8',
        },
        alabaster: {
          50: '#F6F5F1', // Light mode Global BG
          100: '#EFECE6',
        },
        terracotta: '#C16C4B',
        'gold-ochre': '#DDA05E',
        mint: '#6ED6A4',
        'emerald-ink': '#064E3B',
        emerald: {
          50: '#DFEEE7',
          100: '#DFEEE7',
          200: '#C3DDD0',
          300: '#96C6B0',
          400: '#6AA88F',
          500: '#2E8767',
          600: '#177251',
          700: '#165C42',
          800: '#124733',
          900: '#064E3B',
          950: '#062015',
        },
      },
      boxShadow: {
        'glow-green': '0 0 24px -2px rgba(34, 197, 94, 0.4)',
        'glow-green-lg': '0 0 36px 0 rgba(34, 197, 94, 0.55)',
        'glow-green-sm': '0 0 12px 0 rgba(34, 197, 94, 0.3)',
        'glow-emerald': '0 0 20px -2px rgba(16, 185, 129, 0.4)',
        glass: '0 4px 20px -2px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glass-hover':
          '0 8px 30px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.14)',
        'glass-light':
          '0 4px 20px -2px rgba(4, 26, 16, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
        'glass-panel':
          '0 20px 50px -10px rgba(13, 40, 30, 0.12), 0 2px 10px -2px rgba(13, 40, 30, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
        'glass-panel-dark':
          '0 24px 60px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'radial-glow-light':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16, 185, 129, 0.12), rgba(248, 250, 249, 0))',
        'radial-glow-dark':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(52, 211, 153, 0.10), rgba(7, 19, 14, 0))',
      },
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
      },
      keyframes: {
        meshFloat: {
          '50%': { transform: 'translate(25px, -18px) scale(1.06)' },
          '100%': { transform: 'translate(-20px, 15px) scale(0.96)' },
        },
      },
      animation: {
        'mesh-float': 'meshFloat 22s ease-in-out infinite alternate',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
