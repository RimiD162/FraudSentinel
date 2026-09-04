/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0E14',
          page: '#0B0E14',
          alt: '#0D1017',
        },
        card: {
          DEFAULT: '#161A22',
          hover: '#1C212B',
        },
        border: {
          subtle: '#222734',
          DEFAULT: '#222734',
        },
        badge: {
          DEFAULT: '#282E3E',
        },
        brand: {
          blue: '#2563EB',
          'blue-light': '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
