/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add custom colors for neurodivergent theme
        'nd-background': '#fffbeb',
        'nd-text': '#1f2937',
        'nd-border': '#fcd34d',
        'nd-primary': '#0d9488',
        'nd-primary-hover': '#0f766e',
        'nd-secondary': '#fef3c7',
        'nd-secondary-hover': '#fde68a',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}