/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#1C1917',
        'surface': '#292524',
        'text-cream': '#FFFBEB',
        'gold': '#B8860B',
        'gold-light': '#DAA520',
        'border-dark': '#44403C',
        'rating-sss': '#FFD700',
        'rating-ss': '#FF69B4',
        'rating-s': '#FF8C00',
        'rating-a': '#9370DB',
        'rating-b': '#4169E1',
      },
      fontFamily: {
        'title': ['"Cormorant Garamond"', 'serif'],
        'body': ['Raleway', 'sans-serif'],
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(184, 134, 11, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(184, 134, 11, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
