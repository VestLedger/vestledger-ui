const { nextui } = require("@nextui-org/react");
const path = require("path");
const { colors } = require("./src/styles/colors");

/**
 * THEMING CONFIGURATION
 * =====================
 * Single source of truth: src/styles/colors.js
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
    path.join(path.dirname(require.resolve("@nextui-org/theme")), "**/*.{js,ts,jsx,tsx}"),
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors (default)
        app: {
          bg: colors.light.bg,
          surface: colors.light.surface,
          "surface-2": colors.light["surface-2"],
          "surface-hover": colors.light["surface-hover"],
          border: colors.light.border,
          "border-subtle": colors.light["border-subtle"],
          "border-strong": colors.light["border-strong"],
          text: colors.light.text,
          "text-muted": colors.light["text-muted"],
          "text-subtle": colors.light["text-subtle"],
          primary: colors.light.primary,
          "primary-hover": colors.light["primary-hover"],
          "primary-light": colors.light["primary-light"],
          secondary: colors.light.secondary,
          "secondary-hover": colors.light["secondary-hover"],
          "secondary-light": colors.light["secondary-light"],
          success: colors.light.success,
          "success-light": colors.light["success-light"],
          warning: colors.light.warning,
          "warning-light": colors.light["warning-light"],
          danger: colors.light.danger,
          "danger-light": colors.light["danger-light"],
          info: colors.light.info,
          "info-light": colors.light["info-light"],
          neutral: colors.light.neutral,
          "neutral-light": colors.light["neutral-light"],
          accent: colors.light.accent,
          "accent-hover": colors.light["accent-hover"],
          "accent-light": colors.light["accent-light"],
          link: colors.light.link,
          "link-hover": colors.light["link-hover"],
        },
        // Dark mode colors (accessed via dark: prefix)
        "app-dark": {
          bg: colors.dark.bg,
          surface: colors.dark.surface,
          "surface-2": colors.dark["surface-2"],
          "surface-hover": colors.dark["surface-hover"],
          border: colors.dark.border,
          "border-subtle": colors.dark["border-subtle"],
          "border-strong": colors.dark["border-strong"],
          text: colors.dark.text,
          "text-muted": colors.dark["text-muted"],
          "text-subtle": colors.dark["text-subtle"],
          primary: colors.dark.primary,
          "primary-hover": colors.dark["primary-hover"],
          "primary-light": colors.dark["primary-light"],
          secondary: colors.dark.secondary,
          "secondary-hover": colors.dark["secondary-hover"],
          "secondary-light": colors.dark["secondary-light"],
          success: colors.dark.success,
          "success-light": colors.dark["success-light"],
          warning: colors.dark.warning,
          "warning-light": colors.dark["warning-light"],
          danger: colors.dark.danger,
          "danger-light": colors.dark["danger-light"],
          info: colors.dark.info,
          "info-light": colors.dark["info-light"],
          neutral: colors.dark.neutral,
          "neutral-light": colors.dark["neutral-light"],
          accent: colors.dark.accent,
          "accent-hover": colors.dark["accent-hover"],
          "accent-light": colors.dark["accent-light"],
          link: colors.dark.link,
          "link-hover": colors.dark["link-hover"],
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
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
      },
    }),
  ],
};
