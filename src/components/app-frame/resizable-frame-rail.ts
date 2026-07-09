"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { safeLocalStorage } from "@/lib/storage/safeLocalStorage";

export const DEFAULT_RAIL_WIDTH = 515;
export const MIN_RAIL_WIDTH = 300;
export const MAX_RAIL_WIDTH = 620;
export const RAIL_KEYBOARD_STEP = 12;
export const RAIL_WIDTH_STORAGE_KEY =
  "vestledger-redesigned-app-frame-left-rail-width";
// Read-only fallback so existing /home users keep their chosen width.
export const LEGACY_RAIL_WIDTH_STORAGE_KEY = "vestledger-home-sidebar-width";

export type FrameRailSeparatorProps = {
  role: "separator";
  "aria-label": string;
  "aria-orientation": "vertical";
  "aria-valuemin": number;
  "aria-valuemax": number;
  "aria-valuenow": number;
  "aria-valuetext": string;
  title: string;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
};

const clampRailWidth = (width: number) =>
  Math.min(MAX_RAIL_WIDTH, Math.max(MIN_RAIL_WIDTH, width));

function readStoredRailWidth(): number | null {
  const stored = Number(safeLocalStorage.getItem(RAIL_WIDTH_STORAGE_KEY));
  if (Number.isFinite(stored) && stored > 0) {
    return stored;
  }
  const legacy = Number(
    safeLocalStorage.getItem(LEGACY_RAIL_WIDTH_STORAGE_KEY),
  );
  if (Number.isFinite(legacy) && legacy > 0) {
    return legacy;
  }
  return null;
}

export function useResizableFrameRail(): {
  width: number;
  isResizing: boolean;
  separatorProps: FrameRailSeparatorProps;
} {
  const [width, setWidth] = useState(DEFAULT_RAIL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ clientX: number; width: number } | null>(null);

  const updateWidth = useCallback((nextRaw: number) => {
    const next = clampRailWidth(nextRaw);
    setWidth(next);
    safeLocalStorage.setItem(RAIL_WIDTH_STORAGE_KEY, String(next));
  }, []);

  useEffect(() => {
    const stored = readStoredRailWidth();
    if (stored !== null) {
      setWidth(clampRailWidth(stored));
    }
  }, []);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const dragStart = dragStartRef.current;
      if (!dragStart) {
        return;
      }
      updateWidth(dragStart.width + event.clientX - dragStart.clientX);
    };

    const stopResizing = () => {
      dragStartRef.current = null;
      setIsResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [isResizing, updateWidth]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button > 0) {
        return;
      }
      dragStartRef.current = { clientX: event.clientX, width };
      setIsResizing(true);
      event.preventDefault();
    },
    [width],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      let next: number | null = null;
      if (event.key === "ArrowLeft") {
        next = width - RAIL_KEYBOARD_STEP;
      } else if (event.key === "ArrowRight") {
        next = width + RAIL_KEYBOARD_STEP;
      } else if (event.key === "Home") {
        next = MIN_RAIL_WIDTH;
      } else if (event.key === "End") {
        next = MAX_RAIL_WIDTH;
      }
      if (next === null) {
        return;
      }
      event.preventDefault();
      updateWidth(next);
    },
    [width, updateWidth],
  );

  return {
    width,
    isResizing,
    separatorProps: {
      role: "separator",
      "aria-label": "Resize sidebar",
      "aria-orientation": "vertical",
      "aria-valuemin": MIN_RAIL_WIDTH,
      "aria-valuemax": MAX_RAIL_WIDTH,
      "aria-valuenow": width,
      "aria-valuetext": `${width} pixels`,
      title: "Drag to resize sidebar",
      onKeyDown,
      onPointerDown,
    },
  };
}
