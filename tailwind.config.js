/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Reemplazamos los grises fríos por tonos arena y piedra (colores tierra cálidos)
        zinc: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#2c2724', // Marrón oscuro para el fondo de las tarjetas
          900: '#1f1b18', // Marrón casi negro para bordes y menús
        },
        
        // Color de marca: Ámbar / Dorado horneado (cálido, apetitoso y brillante)
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b', // Ámbar principal para botones
          600: '#d97706', // Ámbar oscuro para el efecto al pasar el mouse
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      }
    }
  },
  plugins: [],
}