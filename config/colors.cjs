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
    primary: "#1e40af",
    "primary-hover": "#1d4ed8",
    "primary-light": "#dbeafe",
    secondary: "#d4a332",
    "secondary-hover": "#b8922a",
    "secondary-light": "#fef3c7",

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

    // Sidebar surface
    sidebar: "#ffffff",

    // Overlay backdrop
    overlay: "rgba(28, 25, 23, 0.38)",

    // Vesta / AI (base fallback uses primary blue)
    vesta: "#1e40af",
    "vesta-hover": "#1d4ed8",
    "vesta-light": "#dbeafe",

    // Analytical chart series
    "chart-1": "#1e40af",
    "chart-2": "#0891b2",
    "chart-3": "#2563eb",
    "chart-4": "#d4a332",
    "chart-5": "#6b7280",
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
    primary: "#3b82f6",
    "primary-hover": "#60a5fa",
    "primary-light": "rgba(59, 130, 246, 0.15)",
    secondary: "#fbbf24",
    "secondary-hover": "#fcd34d",
    "secondary-light": "rgba(251, 191, 36, 0.15)",

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

    // Sidebar surface
    sidebar: "#1c1917",

    // Overlay backdrop
    overlay: "rgba(12, 10, 9, 0.72)",

    // Vesta / AI
    vesta: "#3b82f6",
    "vesta-hover": "#60a5fa",
    "vesta-light": "rgba(59, 130, 246, 0.15)",

    // Analytical chart series
    "chart-1": "#3b82f6",
    "chart-2": "#06b6d4",
    "chart-3": "#60a5fa",
    "chart-4": "#fbbf24",
    "chart-5": "#9ca3af",
  },

  internal: {
    light: {
      // Foundations
      bg: "#F3F6FA",
      surface: "#FFFFFF",
      "surface-2": "#F7F9FC",
      "surface-hover": "#EAF0F6",

      // Borders
      border: "#D7E0EA",
      "border-subtle": "#E2EBF4",
      "border-strong": "#AEBCCC",

      // Text
      text: "#172033",
      "text-muted": "#536274",
      "text-subtle": "#617185",

      // Brand — Blue
      primary: "#315DF4",
      "primary-hover": "#4B70F6",
      "primary-light": "#E8EDFF",

      // Brand — Institutional Gold
      secondary: "#956514",
      "secondary-hover": "#7D5510",
      "secondary-light": "#FFF3D6",

      // Status
      success: "#16805A",
      "success-light": "#E1F4EC",
      warning: "#A65A09",
      "warning-light": "#FFF0D8",
      danger: "#C43B46",
      "danger-light": "#FBE7E9",
      info: "#087F83",
      "info-light": "#E0F4F3",
      neutral: "#64748B",
      "neutral-light": "#EDF1F5",

      // Accent & Links (same as primary)
      accent: "#315DF4",
      "accent-hover": "#4B70F6",
      "accent-light": "#E8EDFF",
      link: "#315DF4",
      "link-hover": "#4B70F6",

      // Sidebar
      sidebar: "#FFFFFF",

      // Overlay
      overlay: "rgba(7, 17, 31, 0.38)",

      // Vesta / AI — Violet
      vesta: "#7138C7",
      "vesta-hover": "#5F2BA8",
      "vesta-light": "#F1EAFE",

      // Analytical series
      "chart-1": "#315DF4",
      "chart-2": "#087F83",
      "chart-3": "#7138C7",
      "chart-4": "#956514",
      "chart-5": "#64748B",
    },
    dark: {
      // Foundations
      bg: "#07111F",
      surface: "#0D1D2E",
      "surface-2": "#11263A",
      "surface-hover": "#162D43",

      // Borders
      border: "#20374D",
      "border-subtle": "#182E44",
      "border-strong": "#31516D",

      // Text
      text: "#F4F7FB",
      "text-muted": "#A7B4C3",
      "text-subtle": "#71849A",

      // Brand — Blue
      primary: "#6F8CFF",
      "primary-hover": "#8BA3FF",
      "primary-light": "rgba(111, 140, 255, 0.16)",

      // Brand — Institutional Gold
      secondary: "#F0C45A",
      "secondary-hover": "#F5D06E",
      "secondary-light": "rgba(240, 196, 90, 0.14)",

      // Status
      success: "#36C98F",
      "success-light": "rgba(54, 201, 143, 0.14)",
      warning: "#F2A93B",
      "warning-light": "rgba(242, 169, 59, 0.14)",
      danger: "#FF6B75",
      "danger-light": "rgba(255, 107, 117, 0.14)",
      info: "#24D1C8",
      "info-light": "rgba(36, 209, 200, 0.14)",
      neutral: "#94A3B8",
      "neutral-light": "rgba(148, 163, 184, 0.14)",

      // Accent & Links
      accent: "#6F8CFF",
      "accent-hover": "#8BA3FF",
      "accent-light": "rgba(111, 140, 255, 0.16)",
      link: "#6F8CFF",
      "link-hover": "#8BA3FF",

      // Sidebar
      sidebar: "#091827",

      // Overlay
      overlay: "rgba(2, 7, 14, 0.72)",

      // Vesta / AI — Violet
      vesta: "#A978F0",
      "vesta-hover": "#BB93F5",
      "vesta-light": "rgba(169, 120, 240, 0.16)",

      // Analytical series
      "chart-1": "#6F8CFF",
      "chart-2": "#24D1C8",
      "chart-3": "#A978F0",
      "chart-4": "#F0C45A",
      "chart-5": "#94A3B8",
    },
  },
};

module.exports = { colors };
