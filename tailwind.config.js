/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wiki-blue': '#3366cc',
        'wiki-blue-hover': '#2a4b8d',
        'wiki-search-blue': '#36c',
        'wiki-gray': '#f8f9fa',
        'wiki-border': '#a2a9b1',
        'wiki-text': '#202122',
        'wiki-text-light': '#54595d',
        'wiki-link': '#36c'
      },
      fontFamily: {
        'libertine': "'Linux Libertine', 'serif'",
        'sans': ['sans-serif']
      }
    },
  },
  plugins: [],
}
