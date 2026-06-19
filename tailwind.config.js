export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-navy': '#1D2039',
        'light-navy': '#50589F',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Jersey 25', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
