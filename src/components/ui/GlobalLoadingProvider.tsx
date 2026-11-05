// src/components/ui/GlobalLoadingProvider.tsx
"use client";

import {
  createContext, useContext, useState, useEffect, useRef, useCallback,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import DvdLoadingScreen from "./DvdLoadingScreen";

interface GlobalLoadingContextValue {
  isLoading:    boolean;
  startLoading: (label?: string) => void;
  stopLoading:  () => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);

/**
 * Wraps the app and shows the DVD-bounce loading screen the INSTANT
 * any link or button is tapped — not just when Next.js decides a
 * route segment is fetching. Two trigger paths:
 *
 * 1. AUTOMATIC — a global click listener (capture phase, so it fires
 *    before React's own handlers) watches for clicks on <a> tags and
 *    submit buttons, and shows the loader immediately. It's cleared
 *    automatically once the pathname or search params actually change
 *    (i.e. the new page has mounted).
 *
 * 2. MANUAL — any component can call useGlobalLoading().startLoading()
 *    / stopLoading() around an async action (form submit, document
 *    action, etc.) for actions that don't navigate.
 */
export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [label,     setLabel]     = useState<string | undefined>();
  const pathname       = usePathname();
  const searchParams   = useSearchParams();
  const manualLockRef  = useRef(false); // true while a manual startLoading() is active

  // ── Clear loading automatically once the route has actually changed ──────
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const prevRouteKeyRef = useRef(routeKey);

  useEffect(() => {
    if (prevRouteKeyRef.current !== routeKey) {
      prevRouteKeyRef.current = routeKey;
      // Only auto-clear if this loading state was triggered by navigation,
      // not by a manual startLoading() call still in progress.
      if (!manualLockRef.current) {
        setIsLoading(false);
        setLabel(undefined);
      }
    }
  }, [routeKey]);

  // ── Global capture-phase click listener ───────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Ctrl/Cmd/Shift/Alt/middle-click open a tab or download: no navigation here.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;

      if (anchor) {
        if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
        let url: URL;
        try { url = new URL(anchor.href, window.location.href); } catch { return; }
        if (url.origin !== window.location.origin) return;                 // external
        if (url.pathname === window.location.pathname &&
            url.search   === window.location.search) return;               // same page / hash-only
        manualLockRef.current = false;
        setLabel(undefined);
        setIsLoading(true);
        return;
      }

      // Only buttons that submit a real <form> trigger the loader. Other buttons
      // (accept/reject/sign/approve…) run async work with no route change, so the
      // overlay would never clear until the 8 s safety timeout — they use their
      // own `loading` states or call startLoading()/stopLoading() explicitly.
      const button = target.closest("button") as HTMLButtonElement | null;
      if (button && !button.disabled && !button.hasAttribute("data-skip-global-loading") &&
          button.type === "submit" && button.form) {
        manualLockRef.current = false;
        setLabel(undefined);
        setIsLoading(true);
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  // ── Safety timeout — never leave the screen stuck if something hangs ─────
  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => {
      setIsLoading(false);
      setLabel(undefined);
      manualLockRef.current = false;
    }, 8000);
    return () => clearTimeout(t);
  }, [isLoading]);

  const startLoading = useCallback((customLabel?: string) => {
    manualLockRef.current = true;
    setLabel(customLabel);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    manualLockRef.current = false;
    setIsLoading(false);
    setLabel(undefined);
  }, []);

  return (
    <GlobalLoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && <DvdLoadingScreen label={label ?? "Loading docwaka."} />}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading(): GlobalLoadingContextValue {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx) throw new Error("useGlobalLoading must be used within <GlobalLoadingProvider>");
  return ctx;
}
