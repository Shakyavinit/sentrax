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
        sentinel: {
          950: '#030712',
          900: '#0B0F19',
          850: '#111827',
          800: '#1E293B',
          700: '#334155',
          cyan: '#06B6D4',
          amber: '#F59E0B',
          alert: '#EF4444',
          verified: '#10B981',
        }
      }
    },
  },
  plugins: [],
}
