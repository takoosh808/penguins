/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Primary CTA — clear arctic blue
        butter: {
          50:  "#edf5fc",
          100: "#d5e9f8",
          200: "#aed3f3",
          300: "#79b8ec",
          400: "#4a9de0",
          500: "#3087cc",
          DEFAULT: "#4a9de0",
        },
        // Secondary / fills — pale arctic blue
        sky: {
          50:  "#f0f8ff",
          100: "#e0effc",
          200: "#c4e0f8",
          300: "#96c9f2",
          400: "#60aee8",
          500: "#3494d8",
          DEFAULT: "#c4e0f8",
        },
        // Body background — crisp arctic white
        cloud: "#eef5fb",
      },
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui"],
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
