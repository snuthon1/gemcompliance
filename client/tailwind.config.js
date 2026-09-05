/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gem: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#0052cc',
          700: '#0747a6',
          900: '#091e42'
        },
        cpcl: {
          navy: '#0B192C',
          slate: '#1E3E62',
          orange: '#FF6500'
        }
      }
    },
  },
  plugins: [],
}
