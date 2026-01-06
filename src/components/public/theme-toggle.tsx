'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

/**
 * Minimal client component for theme toggle
 * This is the ONLY client-side JS on public pages (~2 KB)
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch by rendering placeholder during SSR
    return (
      <button
        aria-label="Toggle theme"
        className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] transition-colors"
        disabled
      >
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] transition-colors"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
