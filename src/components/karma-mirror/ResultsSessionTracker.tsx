"use client";

import { useTrackActiveSession } from "@/lib/karma-mirror/session-storage";

export default function ResultsSessionTracker({ sessionId }: { sessionId: string }) {
  useTrackActiveSession(sessionId, `/karma-mirror/results/${sessionId}`);
  return null;
}
