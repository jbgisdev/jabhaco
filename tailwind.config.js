/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7f5',
          100: '#e5ede8',
          200: '#ccdcce',
          300: '#a6c3ab',
          400: '#79a380',
          500: '#56855e',
          600: '#426b49',
          700: '#35553b',
          800: '#2c4431',
          900: '#25392a',
          950: '#131f16',
        },
        sand: {
          50: '#faf9f6',
          100: '#f5f3ec',
          200: '#ebe6d9',
          300: '#ded5c0',
          400: '#cfc0a2',
          500: '#bfab87',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
