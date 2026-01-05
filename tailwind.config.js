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
            background: "#F2F3F5",
            foreground: "#15181E",
            primary: {
              DEFAULT: "#2A3445",
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#9E6A34",
              foreground: "#FFFFFF",
            },
            success: {
              DEFAULT: "#2F7A68",
              foreground: "#FFFFFF",
            },
            warning: {
              DEFAULT: "#B47434",
              foreground: "#FFFFFF",
            },
            danger: {
              DEFAULT: "#B15A50",
              foreground: "#FFFFFF",
            },
            default: {
              DEFAULT: "#FFFFFF",
              foreground: "#15181E",
            },
            focus: "#2A3445",
            content1: "#FFFFFF",
            content2: "#F1F2F4",
            content3: "#E8EAEF",
            content4: "#DFE3EA",
          },
          extend: "light",
        },
        dark: {
          colors: {
            background: "#0C1116",
            foreground: "#E7EBF1",
            primary: {
              DEFAULT: "#35455E",
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#B67D40",
              foreground: "#0C1116",
            },
            success: {
              DEFAULT: "#4A8C79",
              foreground: "#0C1116",
            },
            warning: {
              DEFAULT: "#C9823F",
              foreground: "#0C1116",
            },
            danger: {
              DEFAULT: "#BB6A60",
              foreground: "#0C1116",
            },
            default: {
              DEFAULT: "#171D24",
              foreground: "#E7EBF1",
            },
            focus: "#35455E",
            content1: "#171D24",
            content2: "#1D242E",
            content3: "#242D39",
            content4: "#2C3746",
          },
          extend: "dark",
        },
      },
    }),
  ],
};
