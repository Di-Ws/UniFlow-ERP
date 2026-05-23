/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color)',
          hover: 'var(--primary-hover)',
        },
        dark: {
          bg: '#050814',
          card: '#0f1322',
          border: '#1e293b',
          text: '#f1f5f9',
          muted: '#94a3b8',
        }
      },
    },
  },
  plugins: [],
}
