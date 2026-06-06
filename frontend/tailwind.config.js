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
        // ── Dark editorial surfaces (matches public site) ──────────────────
        dark: {
          DEFAULT: '#1C1813',   // near-black — main bg
          card:    '#221E1A',   // dark card surfaces
          border:  '#3C3830',   // dark borders
        },
        // ── v0 semantic tokens (CSS-variable backed) ───────────────────────
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT:    'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT:    'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border:      'var(--border)',
        input:       'var(--input)',
        ring:        'var(--ring)',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
