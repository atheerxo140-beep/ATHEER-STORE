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
          black: "rgba(var(--brand-black-rgb, 10, 10, 10), <alpha-value>)",
          charcoal: "rgba(var(--brand-charcoal-rgb, 22, 22, 22), <alpha-value>)",
          dark: "rgba(var(--brand-dark-rgb, 28, 28, 30), <alpha-value>)",
          stone: "rgba(var(--brand-stone-rgb, 44, 44, 46), <alpha-value>)",
          ivory: "rgba(var(--brand-ivory-rgb, 251, 249, 245), <alpha-value>)",
          cream: "rgba(var(--brand-cream-rgb, 245, 240, 232), <alpha-value>)",
          sand: "#EAE3D6",
          gold: {
            light: "rgba(var(--brand-gold-light-rgb, 227, 211, 190), <alpha-value>)",
            DEFAULT: "rgba(var(--brand-gold-rgb, 197, 168, 128), <alpha-value>)",
            hover: "rgba(var(--brand-gold-hover-rgb, 184, 150, 108), <alpha-value>)",
            dark: "rgba(var(--brand-gold-dark-rgb, 143, 110, 69), <alpha-value>)",
          },
          border: "rgba(var(--brand-border-rgb, 40, 40, 40), <alpha-value>)",
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
        gold: "0 4px 20px -2px rgba(var(--brand-gold-rgb, 197, 168, 128), 0.25)",
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
