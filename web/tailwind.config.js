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
        "coral-ink": "#a84630",
        "surface-muted": "#f2f0e8",
        "info-ink": "#315b72",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(23, 32, 24, 0.10)",
        card: "0 8px 30px rgba(23, 32, 24, 0.07)",
        lift: "0 14px 36px rgba(23, 32, 24, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 400ms ease-out both",
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [],
};
