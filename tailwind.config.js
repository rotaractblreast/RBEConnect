/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffaf0",
          100: "#feefc7",
          200: "#fed789",
          300: "#fdbe4b",
          400: "#fca31e",
          500: "#ff9000",
          600: "#e07f00",
          700: "#b56200",
          800: "#8e4e00",
          900: "#754003",
          950: "#422001",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Montserrat", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "subtle": "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "card": "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [],
};
