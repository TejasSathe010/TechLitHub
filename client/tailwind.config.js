/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1565D8",
        dark: {
          soft: "#183B56",
          hard: "#0D2436",
          light: "#5A7184"
        }
      },
      fontFamily: {
        opensans: ['Open Sans', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}

