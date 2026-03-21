import { defineConfig, type UserConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const plugins = [react()] as unknown as NonNullable<UserConfig["plugins"]>;

export default defineConfig({
  // The monorepo currently exposes two Vite type trees during Next's build-time
  // typecheck. Cast the runtime-compatible plugin list to the exact config
  // shape Vitest expects without relying on a brittle ts-expect-error.
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: ["node_modules", "cypress", "e2e"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/**",
        "**/node_modules/**",
        "cypress",
        "**/*.config.*",
        "**/mocks/**",
        "**/data/mocks/**",
        "**/*.d.ts",
        "**/types/**",
        "**/__tests__/**",
        "**/*.test.*",
        "**/*.spec.*",
      ],
      all: false,
      reporter: ["text", "json", "html"],
      thresholds: {
        // Sprint 7 floor. Continue ratcheting toward PRD Section 6 target.
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
    setupFiles: ["./src/test/setup.ts"],
  },
});
