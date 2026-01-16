/**
 * Vitest Test Setup
 *
 * This file runs before all tests to configure the testing environment.
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
  root = null;
  rootMargin = '';
  thresholds = [];

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

// Suppress console.error for expected errors in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress React act() warnings and other expected test warnings
  const suppressedWarnings = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: An update to',
    'act(...)',
  ];

  if (
    args.length > 0 &&
    typeof args[0] === 'string' &&
    suppressedWarnings.some((warning) => args[0].includes(warning))
  ) {
    return;
  }

  originalConsoleError.apply(console, args);
};

// Mock localStorage with in-memory storage
const localStorageStore = new Map<string, string>();
const localStorageMock = {
  get length() {
    return localStorageStore.size;
  },
  key: (index: number) => Array.from(localStorageStore.keys())[index] ?? null,
  getItem: (key: string) => localStorageStore.get(key) ?? null,
  setItem: (key: string, value: string) => {
    localStorageStore.set(key, value);
  },
  removeItem: (key: string) => {
    localStorageStore.delete(key);
  },
  clear: () => {
    localStorageStore.clear();
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock scrollTo
window.scrollTo = () => {};
