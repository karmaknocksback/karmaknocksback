import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveTimelineEvents, getSession } from "@/lib/repo/km-assessment";
import type { KMTimelineEvent } from "@/types";

const eventSchema = z.object({
  eventType: z.enum(["relationship", "betrayal", "loss_grief", "career", "health", "conflict", "other"]),
  lifeStage: z.enum(["childhood", "adolescence", "young_adult", "recent", "ongoing"]),
  severity: z.number().int().min(1).max(5),
  resolutionStatus: z.enum(["unresolved", "partially_resolved", "resolved"]),
  note: z.string().max(500).optional(),
});

const schema = z.object({
  sessionId: z.string().min(1),
  events: z.array(eventSchema).max(20), // empty array is valid — this whole step is skippable
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const session = await getSession(data.sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "सत्र नहीं मिला" }, { status: 404 });
    }

    saveTimelineEvents(data.sessionId, data.events as KMTimelineEvent[]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/karma-mirror/timeline] error:", err);
    return NextResponse.json({ success: false, error: "घटनाएं सहेजने में त्रुटि" }, { status: 400 });
  }
}
