const { nextui } = require("@nextui-org/react");
const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    path.join(path.dirname(require.resolve("@nextui-org/theme")), "**/*.{js,ts,jsx,tsx}"),
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: "#FAF8F5", // Warm ivory background
            foreground: "#2D1B4E", // Deep royal purple
            primary: {
              DEFAULT: "#6B46C1", // Rich royal purple
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#D4AF37", // Royal gold
              foreground: "#FFFFFF",
            },
            success: {
              DEFAULT: "#059669", // Emerald jewel
              foreground: "#FFFFFF",
            },
            warning: {
              DEFAULT: "#D97706", // Amber jewel
              foreground: "#FFFFFF",
            },
            danger: {
              DEFAULT: "#DC2626", // Ruby red
              foreground: "#FFFFFF",
            },
            default: {
              DEFAULT: "#FFFFFF", // Pure white surface
              foreground: "#2D1B4E",
            },
            focus: "#6B46C1", // Royal purple focus
            content1: "#FFFFFF", // Pure white cards
            content2: "#FAF8F5", // Warm ivory
            content3: "#F5F3EE", // Warm hover
            content4: "#F0EBE3", // Subtle ivory
          },
          extend: "light",
        },
        dark: {
          colors: {
            background: "#0F0A1A", // Professional deep charcoal
            foreground: "#E8E6F0", // Soft white
            primary: {
              DEFAULT: "#8B7AB8", // Refined royal purple
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#D4AF37", // Royal gold
              foreground: "#0F0A1A",
            },
            success: {
              DEFAULT: "#34D399", // Bright emerald jewel
              foreground: "#0F0A1A",
            },
            warning: {
              DEFAULT: "#FBBF24", // Bright amber jewel
              foreground: "#0F0A1A",
            },
            danger: {
              DEFAULT: "#F87171", // Bright ruby
              foreground: "#0F0A1A",
            },
            default: {
              DEFAULT: "#1A1625", // Dark slate purple surface
              foreground: "#E8E6F0",
            },
            focus: "#8B7AB8", // Refined purple focus
            content1: "#1A1625", // Dark slate surface
            content2: "#241D30", // Subtle hover
            content3: "#2D2438", // Medium surface
            content4: "#36304A", // Elevated surface
          },
          extend: "dark",
        },
      },
    }),
  ],
};
