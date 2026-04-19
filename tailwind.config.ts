import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8ee",
          100: "#fdeccf",
          200: "#fbd28d",
          300: "#f7b45d",
          400: "#f09336",
          500: "#d97721",
          600: "#b85f1b",
          700: "#944618",
          800: "#783a19",
          900: "#633217"
        },
        ink: "#22201b",
        velvet: "#14213d",
        champagne: "#f6e7cf"
      },
      boxShadow: {
        luxe: "0 24px 60px -30px rgba(216, 133, 38, 0.55)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at 20% 25%, rgba(243, 191, 115, 0.35), transparent 40%), radial-gradient(circle at 85% 0%, rgba(255, 240, 201, 0.42), transparent 35%), linear-gradient(115deg, #fff6e8 0%, #fefbf6 40%, #fdf5e8 100%)"
      }
    }
  },
  plugins: []
};

export default config;
