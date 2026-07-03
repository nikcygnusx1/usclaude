export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: 'rgb(var(--navy) / <alpha-value>)', deep: 'rgb(var(--navy-deep) / <alpha-value>)' },
        ice: { DEFAULT: 'rgb(var(--ice) / <alpha-value>)', soft: 'rgb(var(--ice-soft) / <alpha-value>)' },
        grey: { DEFAULT: 'rgb(var(--grey) / <alpha-value>)', light: 'rgb(var(--grey-light) / <alpha-value>)', dark: 'rgb(var(--grey-dark) / <alpha-value>)' },
        line: 'rgb(var(--line) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        status: {
          ready: 'rgb(var(--green) / <alpha-value>)',
          'ready-bg': 'rgba(var(--green) / 0.08)',
          conditional: 'rgb(var(--amber) / <alpha-value>)',
          'conditional-bg': 'rgba(var(--amber) / 0.08)',
          blocked: 'rgb(var(--red) / <alpha-value>)',
          'blocked-bg': 'rgba(var(--red) / 0.08)',
          deferred: 'rgb(var(--grey) / <alpha-value>)',
          'deferred-bg': 'rgb(var(--ice-soft) / <alpha-value>)',
          unverified: 'rgb(var(--indigo) / <alpha-value>)',
          'unverified-bg': 'rgba(var(--indigo) / 0.08)',
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
