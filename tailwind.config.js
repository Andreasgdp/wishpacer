import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
