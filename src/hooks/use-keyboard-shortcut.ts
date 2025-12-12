import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

export function useKeyboardShortcut(
  config: ShortcutConfig,
  callback: () => void,
  deps: any[] = []
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const {
        key,
        metaKey = false,
        ctrlKey = false,
        shiftKey = false,
        altKey = false,
      } = config;

      const modifiersMatch =
        event.metaKey === metaKey &&
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey;

      const keyMatches = event.key.toLowerCase() === key.toLowerCase();

      if (modifiersMatch && keyMatches) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.key, config.metaKey, config.ctrlKey, config.shiftKey, config.altKey, ...deps]);
}
