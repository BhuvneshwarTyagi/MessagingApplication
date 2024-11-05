/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B4513',
        primary_light: '#9C6136',
        secondary: '#FFA07A',
        text: '#FFF8DC',
      },
      keyframes: {
        'slide-left': {
          '0%': { transform: 'translateX(100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slide-right': {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'message-appear': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'slide-left': 'slide-left 0.3s ease-out forwards',
        'slide-right': 'slide-right 0.3s ease-out forwards',
        'message-appear': 'message-appear 0.4s ease-out forwards'
      }
    },
  },
  plugins: [],
}

