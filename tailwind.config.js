const { nextui } = require("@nextui-org/react");
const path = require("path");

/**
 * THEMING CONFIGURATION
 * =====================
 * Single source of truth: src/styles/globals.css
 *
 * This file does two things:
 * 1. Maps CSS variables to Tailwind utilities (bg-app-primary, text-app-muted)
 * 2. Provides NextUI theme colors (NextUI requires hex values, not CSS variables)
 *
 * WHEN CHANGING COLORS:
 * - Edit globals.css (the source of truth)
 * - Update NextUI theme hex values below to match
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    path.join(path.dirname(require.resolve("@nextui-org/theme")), "**/*.{js,ts,jsx,tsx}"),
  ],
  theme: {
    extend: {
      // Expose CSS variables as Tailwind utilities (e.g., bg-app-primary, text-app-muted)
      colors: {
        app: {
          bg: "var(--app-bg)",
          surface: "var(--app-surface)",
          "surface-2": "var(--app-surface-2)",
          "surface-hover": "var(--app-surface-hover)",
          border: "var(--app-border)",
          "border-subtle": "var(--app-border-subtle)",
          "border-strong": "var(--app-border-strong)",
          text: "var(--app-text)",
          "text-muted": "var(--app-text-muted)",
          "text-subtle": "var(--app-text-subtle)",
          primary: "var(--app-primary)",
          "primary-hover": "var(--app-primary-hover)",
          "primary-bg": "var(--app-primary-bg)",
          secondary: "var(--app-secondary)",
          "secondary-hover": "var(--app-secondary-hover)",
          "secondary-bg": "var(--app-secondary-bg)",
          success: "var(--app-success)",
          "success-bg": "var(--app-success-bg)",
          warning: "var(--app-warning)",
          "warning-bg": "var(--app-warning-bg)",
          danger: "var(--app-danger)",
          "danger-bg": "var(--app-danger-bg)",
          info: "var(--app-info)",
          "info-bg": "var(--app-info-bg)",
          accent: "var(--app-accent)",
          "accent-hover": "var(--app-accent-hover)",
          link: "var(--app-link)",
          "link-hover": "var(--app-link-hover)",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      // NextUI requires hex values (doesn't support CSS variables)
      // Keep these in sync with globals.css
      themes: {
        light: {
          colors: {
            background: "#fafaf8", // --app-bg
            foreground: "#1a1f1e", // --app-text
            primary: {
              DEFAULT: "#047857",
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#d4a332",
              foreground: "#FFFFFF",
            },
            success: {
              DEFAULT: "#16a34a",
              foreground: "#FFFFFF",
            },
            warning: {
              DEFAULT: "#d97706",
              foreground: "#FFFFFF",
            },
            danger: {
              DEFAULT: "#dc2626",
              foreground: "#FFFFFF",
            },
            default: {
              DEFAULT: "#ffffff",
              foreground: "#1a1f1e",
            },
            focus: "#047857",
          },
          extend: "light",
        },
        dark: {
          colors: {
            background: "#0f1412", // --app-bg
            foreground: "#f7f7f6", // --app-text
            primary: {
              DEFAULT: "#10b981",
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#fbbf24",
              foreground: "#0f1412",
            },
            success: {
              DEFAULT: "#22c55e",
              foreground: "#0f1412",
            },
            warning: {
              DEFAULT: "#f59e0b",
              foreground: "#0f1412",
            },
            danger: {
              DEFAULT: "#ef4444",
              foreground: "#0f1412",
            },
            default: {
              DEFAULT: "#161c1a",
              foreground: "#f7f7f6",
            },
            focus: "#10b981",
          },
          extend: "dark",
        },
      },
    }),
  ],
};
