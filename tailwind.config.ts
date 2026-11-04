import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0A0A0A",
          charcoal: "#161616",
          dark: "#1C1C1E",
          stone: "#2C2C2E",
          ivory: "#FBF9F5",
          cream: "#F5F0E8",
          sand: "#EAE3D6",
          gold: {
            light: "#E3D3BE",
            DEFAULT: "#C5A880",
            hover: "#B8966C",
            dark: "#8F6E45",
          },
          border: "#282828",
          "border-light": "#E8E2D8",
          muted: "#8E8E93",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        arabic: ["var(--font-tajawal)", "sans-serif"],
        "arabic-serif": ["var(--font-amiri)", "serif"],
      },
      letterSpacing: {
        widest: ".25em",
        luxury: ".35em",
      },
      boxShadow: {
        gold: "0 4px 20px -2px rgba(197, 168, 128, 0.25)",
        luxury: "0 20px 40px -15px rgba(0, 0, 0, 0.15)",
        "luxury-dark": "0 20px 40px -15px rgba(0, 0, 0, 0.6)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
        "slide-down": "slideDown 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
