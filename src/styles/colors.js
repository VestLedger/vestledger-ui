/**
 * SINGLE SOURCE OF TRUTH FOR ALL COLORS
 * ======================================
 * All theme colors are defined here.
 * Used by: tailwind.config.js, globals.css
 *
 * Usage in components:
 * - Tailwind classes: bg-app-primary, text-app-muted, border-app-border
 * - Dark mode: dark:bg-app-dark-primary
 * - NextUI props: color="primary", color="danger"
 * - CSS variables: var(--app-primary) for third-party libs only
 *
 * PALETTE: Blue & Gold
 * - Primary: Deep Blue (#1e40af light, #3b82f6 dark)
 * - Secondary: Rich Gold (#d4a332 light, #fbbf24 dark)
 * - Accent: Lighter Blue (#2563eb light, #60a5fa dark)
 */

const colors = {
  light: {
    // Foundations
    bg: "#fafaf9",
    surface: "#ffffff",
    "surface-2": "#f5f5f4",
    "surface-hover": "#e7e5e4",

    // Borders
    border: "#d6d3d1",
    "border-subtle": "#e7e5e4",
    "border-strong": "#a8a29e",

    // Text
    text: "#1c1917",
    "text-muted": "#57534e",
    "text-subtle": "#78716c",

    // Brand - Blue & Gold
    primary: "#1e40af",         // Deep blue
    "primary-hover": "#1d4ed8", // Slightly brighter blue
    "primary-light": "#dbeafe", // Light blue tint (for backgrounds)
    secondary: "#d4a332",       // Rich gold
    "secondary-hover": "#b8922a",
    "secondary-light": "#fef3c7", // Light gold tint (for backgrounds)

    // Status
    success: "#16a34a",
    "success-light": "#dcfce7",
    warning: "#d97706",
    "warning-light": "#fef3c7",
    danger: "#dc2626",
    "danger-light": "#fee2e2",
    info: "#0891b2",
    "info-light": "#cffafe",

    // Neutral status (for gray states like 'mixed', 'neutral', 'pending')
    neutral: "#6b7280",
    "neutral-light": "#f3f4f6",

    // Accent - complementary blue
    accent: "#2563eb",
    "accent-hover": "#1d4ed8",
    "accent-light": "#dbeafe",

    // Links
    link: "#1e40af",
    "link-hover": "#1d4ed8",
  },

  dark: {
    // Foundations
    bg: "#0c0a09",
    surface: "#1c1917",
    "surface-2": "#292524",
    "surface-hover": "#44403c",

    // Borders
    border: "#44403c",
    "border-subtle": "#292524",
    "border-strong": "#57534e",

    // Text
    text: "#fafaf9",
    "text-muted": "#a8a29e",
    "text-subtle": "#78716c",

    // Brand - Blue & Gold
    primary: "#3b82f6",         // Bright blue
    "primary-hover": "#60a5fa", // Lighter blue
    "primary-light": "rgba(59, 130, 246, 0.15)", // Blue with opacity
    secondary: "#fbbf24",       // Bright gold
    "secondary-hover": "#fcd34d",
    "secondary-light": "rgba(251, 191, 36, 0.15)", // Gold with opacity

    // Status
    success: "#22c55e",
    "success-light": "rgba(34, 197, 94, 0.15)",
    warning: "#f59e0b",
    "warning-light": "rgba(245, 158, 11, 0.15)",
    danger: "#ef4444",
    "danger-light": "rgba(239, 68, 68, 0.15)",
    info: "#06b6d4",
    "info-light": "rgba(6, 182, 212, 0.15)",

    // Neutral status
    neutral: "#9ca3af",
    "neutral-light": "rgba(156, 163, 175, 0.15)",

    // Accent - complementary blue
    accent: "#60a5fa",
    "accent-hover": "#93c5fd",
    "accent-light": "rgba(96, 165, 250, 0.15)",

    // Links
    link: "#3b82f6",
    "link-hover": "#60a5fa",
  },
};

module.exports = { colors };
