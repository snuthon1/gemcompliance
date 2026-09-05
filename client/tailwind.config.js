/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0E2A47',      // Primary Govt / GeM Deep Navy Blue
          navyDark: '#08192C',  // Darker shade for sidebar / headers
          navyLight: '#163E66', // Active item background
          saffron: '#FF7700',   // Official UX4G National Saffron Accent
          saffronDark: '#D95F00',
          saffronLight: '#FFF4EB',
          green: '#008800',     // Official UX4G India Green / Pass
          greenLight: '#E6F4EA',
          greenDark: '#006600',
          red: '#DC2626',       // Official Vigilance / Debarred Flag
          redLight: '#FEE2E2',
          blue: '#0284C7',      // Info / Secondary Blue
          ashoka: '#002B66',    // Ashoka Blue
          slateBg: '#F4F6F9',   // Official institutional light background
        },
        brand: {
          50: '#F0F5FA',
          100: '#E1EBF5',
          200: '#C3D7EB',
          300: '#94BBE0',
          400: '#5F9CD0',
          500: '#3B82C0',
          600: '#0E2A47', // Maps brand-600 to Gov Navy
          700: '#0A1F36',
          800: '#071626',
          900: '#040C17',
          950: '#02060D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
