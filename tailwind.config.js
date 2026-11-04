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
        'spa-rose': {
          50: '#fff5f5',
          100: '#ffe8e8',
          200: '#ffd0d0',
          300: '#fba7a7',
          400: '#f47171',
          500: '#df7970',
          600: '#ca584e',
          700: '#a73e35',
          800: '#89342e',
          900: '#722e29',
        },
        'spa-gold': {
          50: '#fdfbf7',
          100: '#fbf7ee',
          200: '#f5ebd3',
          300: '#ebd9a9',
          400: '#dfb76c',
          500: '#cc9c42',
          600: '#ad7c2b',
        },
        'spa-emerald': {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        'spa-slate': {
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b1120',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -5px rgba(223, 121, 112, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'luxury-hover': '0 20px 40px -10px rgba(223, 121, 112, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.08)',
        'gold': '0 8px 25px -4px rgba(223, 183, 108, 0.25)',
      }
    },
  },
  plugins: [],
}

