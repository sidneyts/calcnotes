/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- ESTA É A LINHA ADICIONADA
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

