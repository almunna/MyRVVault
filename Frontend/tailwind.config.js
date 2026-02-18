/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        'site': '1440px',
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}
