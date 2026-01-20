/**
 * SINGLE SOURCE OF TRUTH FOR ALL COLORS
 * ======================================
 * All theme colors are defined here.
 * Used by: tailwind.config.js
 *
 * Usage in components:
 * - Tailwind classes: bg-app-primary, text-app-muted, border-app-border
 * - NextUI props: color="primary", color="danger"
 */

const colors = {
  light: {
    // Foundations
    bg: "#fafaf8",
    surface: "#ffffff",
    "surface-2": "#f5f4f0",
    "surface-hover": "#eceae4",

    // Borders
    border: "#d9d6cf",
    "border-subtle": "#e4e2dc",
    "border-strong": "#c5c1b8",

    // Text
    text: "#1a1f1e",
    "text-muted": "#4a5250",
    "text-subtle": "#6e7572",

    // Brand
    primary: "#047857",
    "primary-hover": "#059669",
    secondary: "#d4a332",
    "secondary-hover": "#b8922a",

    // Status
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#0891b2",

    // Accent
    accent: "#0d9488",
    "accent-hover": "#0f766e",

    // Links
    link: "#047857",
    "link-hover": "#059669",
  },

  dark: {
    // Foundations
    bg: "#0f1412",
    surface: "#161c1a",
    "surface-2": "#1c2421",
    "surface-hover": "#242d2a",

    // Borders
    border: "#2d3835",
    "border-subtle": "#232c29",
    "border-strong": "#3a4743",

    // Text
    text: "#f7f7f6",
    "text-muted": "#c4cac8",
    "text-subtle": "#919996",

    // Brand
    primary: "#10b981",
    "primary-hover": "#34d399",
    secondary: "#fbbf24",
    "secondary-hover": "#fcd34d",

    // Status
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#06b6d4",

    // Accent
    accent: "#14b8a6",
    "accent-hover": "#2dd4bf",

    // Links
    link: "#10b981",
    "link-hover": "#34d399",
  },
};

module.exports = { colors };
