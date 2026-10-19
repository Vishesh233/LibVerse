/*
 * LibVerse design tokens - single source of truth for the AMOLED navy / indigo-violet theme.
 * The same values are mirrored as CSS variables in src/styles/index.css (:root).
 * Text colours are contrast-checked against `surface` (#111827):
 *   text-primary 16.9:1, text-secondary 6.9:1, text-muted 5.8:1 (all >= 4.5:1)
 */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      colors: {
        /* Surfaces */
        background: '#050816',
        'background-secondary': '#07111F',
        surface: '#111827',
        'surface-raised': '#172033',
        'card-bg': '#111827',
        card: '#111827', // `bg-card` was used in several places but never defined
        navbar: '#081120',
        sidebar: '#0B1220',
        border: '#1E293B',
        'border-light': 'rgba(255, 255, 255, 0.08)',
        input: '#0F172A',

        /* Text */
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-muted': '#8494AB',
        muted: '#8494AB',

        /* Accents: primary indigo-violet, secondary cyan used sparingly for highlights/glow */
        primary: {
          DEFAULT: '#6366F1',
          strong: '#4F46E5',
          violet: '#7C3AED',
          soft: '#A5B4FC',
        },
        accent: '#22D3EE',

        /* Primary Gradient (kept for existing classes) */
        'indigo-500': '#6366F1',
        'indigo-700': '#4F46E5',
        'violet-600': '#7C3AED',

        /* Status */
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Page titles and big numbers only
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },

      borderRadius: {
        control: '12px', // buttons, inputs
        card: '24px',
        xl2: "20px",
      },

      boxShadow: {
        card: "0 20px 60px rgba(0,0,0,0.35)",
        dropdown: "0 20px 45px rgba(0,0,0,0.30)",
        soft: "0 6px 24px rgba(0,0,0,0.18)",
        glow: "0 8px 30px rgba(99,102,241,0.12)",
        'glow-strong': "0 0 0 1px rgba(99,102,241,0.25), 0 10px 40px rgba(99,102,241,0.25)",
        'glow-accent': "0 0 0 1px rgba(34,211,238,0.25), 0 10px 40px rgba(34,211,238,0.18)",
      },

      transitionDuration: {
        250: "250ms",
      },
      backgroundImage: {
        'indigo-violet': 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
        'indigo-violet-hover': 'linear-gradient(90deg, #4338CA 0%, #6D28D9 100%)',
      },
    },
  },

  plugins: [],
};
