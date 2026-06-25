/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./app.jsx"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Instrument Serif"', 'serif'],
        body: ['Barlow', 'system-ui', 'sans-serif'],
      },
      colors: {
        bgprimary: '#030814',
        bgsecondary: '#0A1628',
        surface: '#0F1F3A',
        neonblue: '#2DA8FF',
        neongreen: '#4DFF9C',
      },
    },
  },
  plugins: [],
};
