/**
 * Tracks the visitor's active Karma Mirror session ID across navigation
 * within a single browser session.
 *
 * Deliberately uses `sessionStorage`, not `localStorage`:
 * - sessionStorage persists across page loads/navigation within the same
 *   tab (so leaving the kundli step to check something on /jap-library
 *   and coming back doesn't lose progress).
 * - sessionStorage is cleared automatically when the browser (or tab) is
 *   closed — no manual cleanup needed, no stale session lingering
 *   indefinitely on a shared/public computer.
 * localStorage would persist forever until explicitly cleared, which is
 * not what was asked for here.
 */

import { useEffect } from "react";

const STORAGE_KEY = "km_active_session_id";
const PATH_KEY = "km_active_session_path";

export interface ActiveSession {
  sessionId: string;
  path: string;
}

export function getActiveSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  try {
    const sessionId = window.sessionStorage.getItem(STORAGE_KEY);
    const path = window.sessionStorage.getItem(PATH_KEY);
    if (!sessionId || !path) return null;
    return { sessionId, path };
  } catch {
    return null;
  }
}

export function getActiveSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    // sessionStorage can throw in some locked-down/private-browsing contexts
    return null;
  }
}

/** Call on mount of every step page (quiz/kundli/timeline/narrative) with
 * the current URL path, so resume always lands exactly where the visitor
 * left off — not just at a generic "continue" step. */
export function setActiveSession(sessionId: string, path: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, sessionId);
    window.sessionStorage.setItem(PATH_KEY, path);
  } catch {
    // ignore — resume just won't work in this context, not fatal
  }
}

export function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(PATH_KEY);
  } catch {
    // ignore
  }
}

/** React hook: call once at the top of any Karma Mirror step component
 * with its sessionId and current path. Keeps the "resume here" pointer
 * in sync as the visitor progresses through the flow. */
export function useTrackActiveSession(sessionId: string, path: string): void {
  useEffect(() => {
    setActiveSession(sessionId, path);
  }, [sessionId, path]);
}
