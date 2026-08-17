/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172018",
        moss: "#2f6f4e",
        sage: "#dcebdc",
        cream: "#f7f5ee",
        coral: "#e77b5d",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(23, 32, 24, 0.10)",
      },
    },
  },
  plugins: [],
};
