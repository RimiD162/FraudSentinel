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
          DEFAULT: '#FFFFFF',
          page: '#FAFAF8',
          alt: '#F6F5F0',
          surface: '#FFFFFF',
        },
        gold: {
          50: '#FCF9F2',
          100: '#F7F0DF',
          200: '#EEDCB8',
          300: '#E0C58A',
          400: '#D4AF37', // Classic metallic gold
          500: '#C59A3F',
          600: '#B0832F',
          700: '#8F6622',
          800: '#71501E',
          900: '#4A3414',
        },
        card: {
          DEFAULT: '#FFFFFF',
          hover: '#FDFCFA',
        },
        border: {
          subtle: '#EFE8D8',
          DEFAULT: '#E5DCBE',
          gold: '#DFC78E',
        },
        badge: {
          DEFAULT: '#F5EEDC',
        },
        brand: {
          gold: '#C59A3F',
          'gold-light': '#D4AF37',
          'gold-dark': '#8F6622',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 2px 8px -2px rgba(212, 175, 55, 0.15)',
        'gold-md': '0 8px 24px -4px rgba(212, 175, 55, 0.18)',
        'gold-lg': '0 16px 36px -6px rgba(197, 154, 63, 0.22)',
      },
    },
  },
  plugins: [],
};
