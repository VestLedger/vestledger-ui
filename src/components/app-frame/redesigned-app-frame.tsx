"use client";

import type { CSSProperties, ReactNode } from "react";
import { cx } from "./cx";
import { useResizableFrameRail } from "./resizable-frame-rail";

export type RedesignedAppFrameProps = {
  rail: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  rightRail?: ReactNode;
};

export function RedesignedAppFrame({
  rail,
  topbar,
  children,
  rightRail,
}: RedesignedAppFrameProps) {
  const { width, isResizing, separatorProps } = useResizableFrameRail();

  return (
    <div
      className={cx(
        "min-h-screen bg-app-bg text-app-text dark:bg-app-dark-bg dark:text-app-dark-text xl:h-screen xl:overflow-hidden",
        isResizing && "select-none xl:cursor-col-resize",
      )}
    >
      <a
        href="#app-frame-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-app-border focus:bg-app-surface focus:px-4 focus:py-2 focus:text-sm focus:text-app-text dark:focus:border-app-dark-border dark:focus:bg-app-dark-surface dark:focus:text-app-dark-text"
      >
        Skip to main content
      </a>
      <div
        className="grid min-h-screen min-w-0 xl:h-screen xl:grid-cols-[var(--app-frame-rail-width)_minmax(0,1fr)]"
        data-testid="redesigned-app-frame"
        style={
          {
            "--app-frame-rail-width": `${width}px`,
          } as CSSProperties
        }
      >
        <div className="relative min-w-0 xl:h-screen xl:overflow-hidden">
          {rail}
          <button
            type="button"
            {...separatorProps}
            className="group absolute -right-1.5 top-0 z-30 hidden h-full w-3 cursor-col-resize touch-none bg-transparent p-0 outline-none xl:block"
          >
            <span
              className={cx(
                "pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-app-border-strong transition-[width,background-color] dark:bg-app-dark-border-strong",
                "group-hover:w-0.5 group-hover:bg-app-info dark:group-hover:bg-app-dark-info",
                "group-focus-visible:w-0.5 group-focus-visible:bg-app-info dark:group-focus-visible:bg-app-dark-info",
                isResizing && "w-0.5 bg-app-info dark:bg-app-dark-info",
              )}
            />
          </button>
        </div>

        <div
          className="min-w-0 xl:flex xl:h-screen xl:flex-col xl:overflow-hidden"
          data-testid="app-frame-content-shell"
        >
          {topbar}
          <div
            className={cx(
              "grid min-w-0 xl:min-h-0 xl:flex-1 xl:overflow-y-auto",
              rightRail
                ? "xl:grid-cols-[minmax(0,1.6fr)_minmax(330px,0.95fr)]"
                : undefined,
            )}
            data-testid="app-frame-body"
          >
            <main id="app-frame-main" tabIndex={-1} className="min-w-0">
              {children}
            </main>
            {rightRail ?? null}
          </div>
        </div>
      </div>
    </div>
  );
}
