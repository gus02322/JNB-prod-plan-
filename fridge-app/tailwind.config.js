/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Palette "jeu vidéo léger"
        frigo: '#5fd3f2',
        sec: '#f2b95f',
        epices: '#e07b5f',
        cream: '#fdf6ec',
      },
      boxShadow: {
        chunky: '0 4px 0 rgba(0,0,0,0.15)',
        tile: '0 6px 0 rgba(0,0,0,0.12)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.28)' },
          '100%': { transform: 'scale(1)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
          '20%': { opacity: '1' },
          '100%': { transform: 'translateY(-46px) scale(1.1)', opacity: '0' },
        },
        burst: {
          '0%': { transform: 'scale(0)', opacity: '0.9' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        pop: 'pop 0.35s ease-out',
        floatUp: 'floatUp 0.9s ease-out forwards',
        burst: 'burst 0.5s ease-out forwards',
        wiggle: 'wiggle 0.4s ease-in-out',
        slideUp: 'slideUp 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
