/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0A0A0A',
        mist: '#6F6F6F',
        fog: '#ADADAD',
        cream: '#FAF9F6',
        amber: '#C8853A',
        surface: '#F4F2EE',
      },
      keyframes: {
        fadeRise: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-rise':    'fadeRise 0.8s ease-out forwards',
        'fade-rise-d1': 'fadeRise 0.8s 0.15s ease-out both',
        'fade-rise-d2': 'fadeRise 0.8s 0.30s ease-out both',
        'fade-rise-d3': 'fadeRise 0.8s 0.45s ease-out both',
        'fade-in':      'fadeIn 1s ease-out forwards',
        'shimmer':      'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
}
