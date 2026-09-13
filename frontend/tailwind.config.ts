import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: 'var(--bg-void)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        overlay: 'var(--bg-overlay)',
        subtle: 'var(--bg-subtle)',
        borderDim: 'var(--border-dim)',
        borderDefault: 'var(--border-default)',
        borderBright: 'var(--border-bright)',
        borderAccent: 'var(--border-accent)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        accent: {
          DEFAULT: 'var(--accent-primary)',
          bright: 'var(--accent-bright)',
          dim: 'var(--accent-dim)',
        },
        status: {
          alert: 'var(--status-alert)',
          warn: 'var(--status-warn)',
          ok: 'var(--status-ok)',
          info: 'var(--status-info)',
          neutral: 'var(--status-neutral)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
        accent: 'var(--shadow-accent)',
        alert: 'var(--shadow-alert)',
      },
    },
  },
  plugins: [],
} satisfies Config;
