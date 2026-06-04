const { nextui } = require("@nextui-org/react");
const path = require("path");
const { colors } = require("./config/colors.cjs");
const themePlugin = require("./config/tailwind-theme-plugin.cjs");

function appColor(name) {
  return `rgb(var(--app-${name}-rgb) / <alpha-value>)`;
}

function appColorVar(name) {
  return `var(--app-${name})`;
}

/**
 * THEMING CONFIGURATION
 * =====================
 * Single source of truth: config/colors.cjs
 *
 * Usage in components:
 * - Tailwind classes: bg-app-primary, text-app-muted, border-app-border
 * - Dark mode: dark:bg-app-dark-primary (automatically uses dark palette)
 * - NextUI props: color="primary", color="danger"
 *
 * PALETTE: Blue & Gold
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    path.join(
      path.dirname(require.resolve("@nextui-org/theme")),
      "**/*.{js,ts,jsx,tsx}",
    ),
  ],
  theme: {
    extend: {
      colors: (function () {
        const appColors = {
          bg: appColor("bg"),
          surface: appColor("surface"),
          "surface-2": appColor("surface-2"),
          "surface-hover": appColor("surface-hover"),
          border: appColor("border"),
          "border-subtle": appColor("border-subtle"),
          "border-strong": appColor("border-strong"),
          text: appColor("text"),
          "text-muted": appColor("text-muted"),
          "text-subtle": appColor("text-subtle"),
          primary: appColor("primary"),
          "primary-hover": appColor("primary-hover"),
          "primary-light": appColorVar("primary-light"),
          secondary: appColor("secondary"),
          "secondary-hover": appColor("secondary-hover"),
          "secondary-light": appColorVar("secondary-light"),
          success: appColor("success"),
          "success-light": appColorVar("success-light"),
          warning: appColor("warning"),
          "warning-light": appColorVar("warning-light"),
          danger: appColor("danger"),
          "danger-light": appColorVar("danger-light"),
          info: appColor("info"),
          "info-light": appColorVar("info-light"),
          neutral: appColor("neutral"),
          "neutral-light": appColorVar("neutral-light"),
          accent: appColor("accent"),
          "accent-hover": appColor("accent-hover"),
          "accent-light": appColorVar("accent-light"),
          link: appColor("link"),
          "link-hover": appColor("link-hover"),
          sidebar: appColor("sidebar"),
          overlay: appColorVar("overlay"),
          vesta: appColor("vesta"),
          "vesta-hover": appColor("vesta-hover"),
          "vesta-light": appColorVar("vesta-light"),
          "chart-1": appColor("chart-1"),
          "chart-2": appColor("chart-2"),
          "chart-3": appColor("chart-3"),
          "chart-4": appColor("chart-4"),
          "chart-5": appColor("chart-5"),
        };
        return {
          app: appColors,
          "app-dark": appColors,
        };
      })(),
    },
  },
  darkMode: "class",
  plugins: [
    themePlugin,
    nextui({
      themes: {
        light: {
          colors: {
            background: colors.light.bg,
            foreground: colors.light.text,
            primary: {
              DEFAULT: colors.light.primary,
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: colors.light.secondary,
              foreground: "#FFFFFF",
            },
            success: {
              DEFAULT: colors.light.success,
              foreground: "#FFFFFF",
            },
            warning: {
              DEFAULT: colors.light.warning,
              foreground: "#FFFFFF",
            },
            danger: {
              DEFAULT: colors.light.danger,
              foreground: "#FFFFFF",
            },
            default: {
              DEFAULT: colors.light.surface,
              foreground: colors.light.text,
            },
            focus: colors.light.primary,
          },
          extend: "light",
        },
        dark: {
          colors: {
            background: colors.dark.bg,
            foreground: colors.dark.text,
            primary: {
              DEFAULT: colors.dark.primary,
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: colors.dark.secondary,
              foreground: colors.dark.bg,
            },
            success: {
              DEFAULT: colors.dark.success,
              foreground: colors.dark.bg,
            },
            warning: {
              DEFAULT: colors.dark.warning,
              foreground: colors.dark.bg,
            },
            danger: {
              DEFAULT: colors.dark.danger,
              foreground: colors.dark.bg,
            },
            default: {
              DEFAULT: colors.dark.surface,
              foreground: colors.dark.text,
            },
            focus: colors.dark.primary,
          },
          extend: "dark",
        },
        "internal-light": {
          colors: {
            background: colors.internal.light.bg,
            foreground: colors.internal.light.text,
            primary: {
              DEFAULT: colors.internal.light.primary,
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: colors.internal.light.secondary,
              foreground: "#FFFFFF",
            },
            success: {
              DEFAULT: colors.internal.light.success,
              foreground: "#FFFFFF",
            },
            warning: {
              DEFAULT: colors.internal.light.warning,
              foreground: "#FFFFFF",
            },
            danger: {
              DEFAULT: colors.internal.light.danger,
              foreground: "#FFFFFF",
            },
            default: {
              DEFAULT: colors.internal.light.surface,
              foreground: colors.internal.light.text,
            },
            focus: colors.internal.light.primary,
          },
          extend: "light",
        },
        "internal-dark": {
          colors: {
            background: colors.internal.dark.bg,
            foreground: colors.internal.dark.text,
            primary: {
              DEFAULT: colors.internal.dark.primary,
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: colors.internal.dark.secondary,
              foreground: colors.internal.dark.bg,
            },
            success: {
              DEFAULT: colors.internal.dark.success,
              foreground: colors.internal.dark.bg,
            },
            warning: {
              DEFAULT: colors.internal.dark.warning,
              foreground: colors.internal.dark.bg,
            },
            danger: {
              DEFAULT: colors.internal.dark.danger,
              foreground: colors.internal.dark.bg,
            },
            default: {
              DEFAULT: colors.internal.dark.surface,
              foreground: colors.internal.dark.text,
            },
            focus: colors.internal.dark.primary,
          },
          extend: "dark",
        },
      },
    }),
  ],
};
