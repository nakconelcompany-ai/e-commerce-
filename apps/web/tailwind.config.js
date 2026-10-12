/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Vibrant Emerald
          600: '#059669', // Rich Emerald Green
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          gold: '#f59e0b',
        },
        accent: {
          yellow: '#f59e0b',
          gold: '#eab308',
          amber: '#fbbf24',
          light: '#fef08a',
        },
        dark: {
          900: '#06261d', // Luxurious deep emerald dark
          800: '#0c352a',
          700: '#134e3e',
          600: '#1b6753',
        }
      },
    },
  },
  plugins: [],
};
