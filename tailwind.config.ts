import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB"
        }
      },
      boxShadow: {
        glass: "0 10px 40px rgba(15, 23, 42, 0.35)"
      },
      backgroundImage: {
        "dashboard-gradient":
          "radial-gradient(circle at top left, rgba(59,130,246,0.20), transparent 25%), radial-gradient(circle at top right, rgba(168,85,247,0.16), transparent 25%), linear-gradient(135deg, #020617 0%, #0f172a 55%, #111827 100%)"
      }
    }
  },
  plugins: []
};

export default config;
