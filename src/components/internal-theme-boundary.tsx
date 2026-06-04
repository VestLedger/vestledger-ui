"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function InternalThemeBoundary() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const activeClass = isDark ? "internal-dark" : "internal-light";
    const inactiveClass = isDark ? "internal-light" : "internal-dark";

    document.body.classList.add("internal-theme", activeClass);
    document.body.classList.remove(inactiveClass);

    return () => {
      document.body.classList.remove(
        "internal-theme",
        "internal-light",
        "internal-dark",
      );
    };
  }, [isDark]);

  return null;
}
