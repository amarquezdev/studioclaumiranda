/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Warm gold (matches public site primary oklch(0.78 0.07 75)) ────
        gold: {
          DEFAULT: '#D4B98A',
          light:   '#DFC99E',
          dark:    '#BFA070',
        },
        // ── Dark editorial surfaces ──────────────────────────────────────
        dark: {
          DEFAULT: '#1C1813',
          card:    '#221E1A',
          border:  '#3C3830',
        },
        // ── Semantic tokens — hex values so opacity modifiers work in Tailwind v3
        background:  '#1C1813',
        foreground:  '#F2EFE9',
        primary: {
          DEFAULT:    '#D4B98A',
          foreground: '#1C1813',
        },
        secondary: {
          DEFAULT:    '#2E2A25',
          foreground: '#F2EFE9',
        },
        muted: {
          DEFAULT:    '#2E2A25',
          foreground: '#A09890',
        },
        card: {
          DEFAULT:    '#221E1A',
          foreground: '#F2EFE9',
        },
        border:  '#3C3830',
        input:   '#2E2A25',
        ring:    '#D4B98A',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
