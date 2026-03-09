/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          // Coinbase-ish blue
          50: '#EEF4FF',
          100: '#D9E6FF',
          200: '#B3CCFF',
          300: '#80AAFF',
          400: '#4D88FF',
          500: '#1A66FF',
          600: '#0052FF',
          700: '#0045D6',
          800: '#0037AD',
          900: '#002A85',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(17, 24, 39, 0.08)',
        card: '0 8px 24px rgba(17, 24, 39, 0.08)',
      },
    },
  },
  plugins: [],
}
