export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      colors: {
        /* AMOLED Theme Tokens */
        background: '#050816',
        'background-secondary': '#07111F',
        'card-bg': '#111827',
        navbar: '#081120',
        sidebar: '#0B1220',
        border: '#1E293B',
        input: '#0F172A',

        /* Text */
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        muted: '#64748B',

        /* Primary Gradient */
        'indigo-500': '#6366F1',
        'indigo-700': '#4F46E5',
        'violet-600': '#7C3AED',

        /* Status */
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },

      borderRadius: {
        xl2: "20px",
      },

      boxShadow: {
        card: "0 20px 60px rgba(0,0,0,0.35)",
        dropdown: "0 20px 45px rgba(0,0,0,0.30)",
        soft: "0 6px 24px rgba(0,0,0,0.18)",
        glow: "0 8px 30px rgba(99,102,241,0.12)",
      },

      transitionDuration: {
        250: "250ms",
      },
      backgroundImage: {
        'indigo-violet': 'linear-gradient(90deg, #6366F1 0%, #7C3AED 100%)',
        'indigo-violet-hover': 'linear-gradient(90deg, #4F46E5 0%, #6D28D9 100%)',
      },
    },
  },

  plugins: [],
};