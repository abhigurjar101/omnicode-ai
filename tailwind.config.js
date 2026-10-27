/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/web/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#000000",
          near: "#080808",
          card: "#0d0d0d",
          elevated: "#121212",
        },
        crimson: {
          deep: "#5F0000",
          dark: "#490000",
          border: "#3A1515",
          glow: "rgba(237, 51, 39, 0.15)",
        },
        signal: {
          red: "#ED3327",
          hover: "#d92b20",
          active: "#bf2016",
        },
        cinematic: {
          white: "#FFFFFF",
          soft: "#EAEAEA",
          muted: "#A7A7A7",
          faint: "#555555",
          border: "#3A1515",
          panel: "rgba(8, 8, 8, 0.85)",
          panelSolid: "#0a0a0a",
        },
      },
    },
  },
  plugins: [],
};
