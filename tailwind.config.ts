import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#050505",
          50: "#f5f5f5",
          100: "#e5e5e5",
          200: "#c7c7c7",
          300: "#a3a3a3",
          400: "#737373",
          500: "#4d4d4d",
          600: "#333333",
          700: "#1f1f1f",
          800: "#141414",
          900: "#0a0a0a",
          950: "#020202",
        },
        blood: {
          DEFAULT: "#e01224",
          50: "#fef1f1",
          100: "#fddede",
          200: "#fac2c2",
          300: "#f5989a",
          400: "#ee6266",
          500: "#e01224",
          600: "#c40e1f",
          700: "#a10d1c",
          800: "#860f1c",
          900: "#72111c",
          950: "#3f050c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: ".28em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        eq: {
          "0%, 100%": { transform: "scaleY(0.25)" },
          "50%": { transform: "scaleY(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 1s ease-out both",
        eq1: "eq 1.2s ease-in-out infinite",
        eq2: "eq 1.4s ease-in-out infinite 0.15s",
        eq3: "eq 0.9s ease-in-out infinite 0.3s",
        eq4: "eq 1.6s ease-in-out infinite 0.1s",
        eq5: "eq 1.1s ease-in-out infinite 0.25s",
        "pulse-glow": "pulse-glow 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
