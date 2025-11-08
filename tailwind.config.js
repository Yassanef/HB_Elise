/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./final.html",
    "./ressources/**/*.{html,js,jsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        blush: '#FFE8F3',
        lilac: '#F3ECFF',
        rosewood: '#5A2F50',
        petal: '#FFD7E8'
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}

