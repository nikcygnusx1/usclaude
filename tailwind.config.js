export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: 'var(--navy)', deep: 'var(--navy-deep)' },
        ice: { DEFAULT: 'var(--ice)', soft: 'var(--ice-soft)' },
        grey: { DEFAULT: 'var(--grey)', light: 'var(--grey-light)', dark: 'var(--grey-dark)' },
        line: 'var(--line)',
        card: 'var(--card)',
        status: {
          ready: 'var(--status-ready)',
          'ready-bg': 'var(--status-ready-bg)',
          conditional: 'var(--status-conditional)',
          'conditional-bg': 'var(--status-conditional-bg)',
          blocked: 'var(--status-blocked)',
          'blocked-bg': 'var(--status-blocked-bg)',
          deferred: 'var(--status-deferred)',
          'deferred-bg': 'var(--status-deferred-bg)',
          unverified: 'var(--status-unverified)',
          'unverified-bg': 'var(--status-unverified-bg)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
