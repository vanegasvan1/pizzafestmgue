/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Tono cálido, suave y elegante (Terracota/Arcilla apagado) 
        // Esto le dará color al botón de votar y de ingresar, pero sin ser agresivo a la vista.
        brand: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          400: '#d4a392',
          500: '#b87a62', // Color principal suave
          600: '#9c634f', // Color para el efecto hover
          700: '#7a4b3a',
          800: '#5c382a',
          900: '#40251c',
        },
        // Un tono dorado opaco y sutil para suavizar el logo de la pizza y las estrellas
        amber: {
          400: '#d4b483', 
        }
      }
    }
  },
  plugins: [],
}