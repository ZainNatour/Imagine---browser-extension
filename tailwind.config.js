import plugin from 'tailwindcss/plugin';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#4b5563'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: [
    typography,
    plugin(function({ addBase, theme }) {
      addBase({
        ':root': {
          '--color-primary': theme('colors.primary'),
          '--color-secondary': theme('colors.secondary'),
          '--radius-xl': theme('borderRadius.3xl')
        }
      });
    })
  ]
};
