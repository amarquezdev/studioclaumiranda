/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Semantic tokens — hex equivalents of oklch values for opacity support
        background:  '#F6F3EE',
        foreground:  '#342D1E',
        primary: {
          DEFAULT:    '#2E2618',
          foreground: '#F6F3EE',
        },
        secondary: {
          DEFAULT:    '#E3D7C2',
          foreground: '#342D1E',
        },
        muted: {
          DEFAULT:    '#ECE8DA',
          foreground: '#88796A',
        },
        accent: {
          DEFAULT:    '#D8C9A6',
          foreground: '#342D1E',
        },
        card: {
          DEFAULT:    '#FDFCF9',
          foreground: '#342D1E',
        },
        border:  '#CFBFA7',
        input:   '#CFBFA7',
        ring:    '#88796A',
        // ── Legacy aliases (kept for any direct usage in components)
        gold: {
          DEFAULT: '#2E2618',
          light:   '#6B6050',
          dark:    '#1C1813',
        },
        dark: {
          DEFAULT: '#2E2618',
          card:    '#FDFCF9',
          border:  '#CFBFA7',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Jost', 'system-ui', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
