/**
 * Tailwind plugin that generates --app-* and --app-*-rgb CSS custom properties
 * from config/colors.cjs. This replaces the manual variable blocks in globals.css
 * and adds scoped .internal-theme overrides for dashboard/admin routes.
 */
const plugin = require("tailwindcss/plugin");
const { colors } = require("./colors.cjs");

function hexToRgbChannels(hex) {
  if (typeof hex !== "string" || !hex.startsWith("#") || hex.length !== 7) {
    return null;
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

function buildCssVars(palette) {
  const vars = {};
  for (const [key, value] of Object.entries(palette)) {
    vars[`--app-${key}`] = value;
    const rgb = hexToRgbChannels(value);
    if (rgb) {
      vars[`--app-${key}-rgb`] = rgb;
    }
  }
  return vars;
}

module.exports = plugin(function ({ addBase }) {
  addBase({
    ":root": buildCssVars(colors.light),
    ".dark": buildCssVars(colors.dark),
  });

  if (colors.internal) {
    addBase({
      ".internal-theme": buildCssVars(colors.internal.light),
      ".dark .internal-theme": buildCssVars(colors.internal.dark),
    });
  }
});
