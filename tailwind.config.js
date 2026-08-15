/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fdf8f8',
          100: '#F4D8D8', // Color 5 (Blanco grisáceo/rosado)
          200: '#d9c0bf',
          300: '#BEA8A7', // Color 4 (Gris claro)
          400: '#c0a09e', 
          500: '#C09891', // Color 3 (Color principal para botones)
          600: '#9b746a', // Tono intermedio calculado para el hover
          700: '#775144', // Color 2 (Marrón/Gris medio)
          800: '#502c22',
          900: '#2A0800', // Color 1 (Negro/Marrón muy oscuro)
        }
      }
    }
  },
  plugins: [],
}