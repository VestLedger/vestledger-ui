/**
 * Safe localStorage utility
 *
 * Provides SSR-safe localStorage operations with automatic error handling.
 * All operations safely handle:
 * - Server-side rendering (typeof window === 'undefined')
 * - localStorage quota exceeded errors
 * - Invalid JSON parsing
 * - Browser privacy modes that disable localStorage
 */

/**
 * Check if localStorage is available in the current environment
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false;
  }

  try {
    // Test if localStorage is actually usable (can be blocked in private mode)
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely get an item from localStorage
 * @param key - The localStorage key
 * @returns The stored value or null if not found/error
 */
export function getItem(key: string): string | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to read from localStorage (key: ${key})`, error);
    return null;
  }
}

/**
 * Safely set an item in localStorage
 * @param key - The localStorage key
 * @param value - The value to store
 * @returns true if successful, false otherwise
 */
export function setItem(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Failed to write to localStorage (key: ${key})`, error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * @param key - The localStorage key
 * @returns true if successful, false otherwise
 */
export function removeItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove from localStorage (key: ${key})`, error);
    return false;
  }
}

/**
 * Safely clear all localStorage data
 * @returns true if successful, false otherwise
 */
export function clear(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage', error);
    return false;
  }
}

/**
 * Safely get and parse JSON from localStorage
 * @param key - The localStorage key
 * @returns The parsed object or null if not found/invalid JSON
 */
export function getJSON<T>(key: string): T | null {
  const value = getItem(key);
  if (value === null) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Failed to parse JSON from localStorage (key: ${key})`, error);
    return null;
  }
}

/**
 * Safely stringify and set JSON in localStorage
 * @param key - The localStorage key
 * @param value - The object to store
 * @returns true if successful, false otherwise
 */
export function setJSON<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    return setItem(key, serialized);
  } catch (error) {
    console.error(`Failed to stringify JSON for localStorage (key: ${key})`, error);
    return false;
  }
}

/**
 * Default export with all methods
 */
export const safeLocalStorage = {
  isAvailable: isLocalStorageAvailable,
  getItem,
  setItem,
  removeItem,
  clear,
  getJSON,
  setJSON,
};
