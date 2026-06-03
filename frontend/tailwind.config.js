/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Sage green (replaces gold for admin CTAs) ──────────────────────
        gold: {
          DEFAULT: '#6E8060',
          light:   '#7D9070',
          dark:    '#5B6B4F',
        },
        // ── Admin surfaces (remapped to Sage cream palette) ────────────────
        dark: {
          DEFAULT: '#F7F2EC',   // warm cream — main bg
          card:    '#FFFFFF',   // white — card surfaces
          border:  '#E0D9D2',   // light cream — borders
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
