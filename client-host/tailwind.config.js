/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        butter: {
          50:  "#fffef0",
          100: "#fefce0",
          200: "#fdf8b0",
          300: "#fbf176",
          400: "#f7e43a",
          500: "#f0d015",
          DEFAULT: "#f7e43a",
        },
        sky: {
          50:  "#f0f8ff",
          100: "#dff0fe",
          200: "#b8e0fd",
          300: "#7ec8fb",
          400: "#38adf5",
          500: "#0e90e0",
          DEFAULT: "#b8e0fd",
        },
        cloud: "#f9fbff",
      },
      fontFamily: {
        sans: ["Nunito", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
