import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'cypress', 'e2e'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        '**/node_modules/**',
        'cypress',
        '**/*.config.*',
        '**/mocks/**',
        '**/data/mocks/**',
        '**/*.d.ts',
        '**/types/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      all: false,
      reporter: ['text', 'json', 'html'],
      thresholds: {
        // Start with achievable thresholds, increase over time
        statements: 10,
        branches: 10,
        functions: 10,
        lines: 10,
      },
    },
    setupFiles: ['./src/test/setup.ts'],
  },
});
