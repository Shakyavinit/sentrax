/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep enterprise neutral surfaces
        surface: {
          base: '#0B0F17',     // Main page background
          panel: '#111827',    // Primary card/panel surface
          elevated: '#161F30', // Elevated headers/toolbars
          subtle: '#1C2638',   // Input backgrounds, active rows
          hover: '#222E42',    // Row and control hover
        },
        // Refined borders
        border: {
          subtle: '#1F293D',
          strong: '#2D3748',
          active: '#3B82F6',
        },
        // Authoritative enterprise accents
        accent: {
          primary: '#2563EB',   // Subtle blue for active controls
          hover: '#1D4ED8',
          highlight: '#38BDF8', // Cyan for intelligence highlights
          subtle: 'rgba(37, 99, 235, 0.12)',
        },
        // Government & military status semantics
        status: {
          operational: '#10B981', // Green
          warning: '#F59E0B',     // Amber
          critical: '#EF4444',    // Red (Watchlist/Interception)
          info: '#3B82F6',        // Blue (System updates)
          offline: '#6B7280',     // Gray
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'panel': '8px',
        'sm-panel': '6px',
      }
    },
  },
  plugins: [],
}
