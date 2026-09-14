import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        night: {
          950: "#050914",
          900: "#0a0f1f",
          800: "#0f1730",
          700: "#161f3d",
          600: "#1e2a4d",
        },
        neon: {
          green: "#39ff8f",
          greenDark: "#1fcf6c",
          orange: "#ff8a3d",
          orangeDark: "#ff6a00",
        },
      },
      boxShadow: {
        "neon-green": "0 0 8px rgba(57,255,143,0.6), 0 0 24px rgba(57,255,143,0.35)",
        "neon-orange": "0 0 8px rgba(255,138,61,0.6), 0 0 24px rgba(255,138,61,0.35)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      animation: {
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;