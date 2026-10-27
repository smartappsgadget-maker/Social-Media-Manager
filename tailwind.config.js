/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0edff',
          200: '#c7dcfe',
          300: '#9ec1fd',
          400: '#6ea0fb',
          500: '#4379f6',
          600: '#2b5bf0',
          700: '#2046db',
          800: '#1e38b1',
          900: '#1d338c',
          950: '#141f53',
        },
        accent: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          amber: '#f59e0b',
          emerald: '#10b981',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
