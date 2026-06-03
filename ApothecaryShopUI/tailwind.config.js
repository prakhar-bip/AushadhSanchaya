/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        eucalyptus: {
          light: '#335F51',
          DEFAULT: '#132B23',
          dark: '#0B1A15',
        },
        sage: {
          light: '#7C968B',
          DEFAULT: '#556F64',
          dark: '#384B43',
        },
        amberGlass: {
          light: '#E29548',
          DEFAULT: '#C6702D',
          dark: '#93501E',
        },
        alabaster: {
          DEFAULT: '#F8F9F7',
          pure: '#FEFEFD',
        },
        slateCharcoal: {
          DEFAULT: '#1D2622',
        }
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}