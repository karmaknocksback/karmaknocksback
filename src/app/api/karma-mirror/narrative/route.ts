import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkNarrativeSafety, extractNarrativeFeatures } from "@/lib/karma-mirror/narrative";
import { saveNarrativeSubmission, getSession } from "@/lib/repo/km-assessment";

const schema = z.object({
  sessionId: z.string().min(1),
  text: z.string().min(1).max(3000),
});

// Verified current as of this build (June 2026) — government-run, toll-free,
// 24x7, available in multiple Indian languages.
const SUPPORT_RESOURCES_HI = [
  "Tele MANAS (भारत सरकार): 14416 या 1-800-891-4416 — 24x7, कई भाषाओं में उपलब्ध",
  "KIRAN मानसिक स्वास्थ्य हेल्पलाइन: 1800-599-0019 — 24x7",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, text } = schema.parse(body);

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "सत्र नहीं मिला" }, { status: 404 });
    }

    // Safety check runs first, before any feature extraction. This is not
    // configurable — see narrative.ts for why.
    const safety = checkNarrativeSafety(text);
    if (safety.flagged) {
      saveNarrativeSubmission({
        sessionId,
        rawText: text,
        featuresJson: JSON.stringify({ excludedFromScoring: true }),
        safetyFlagged: true,
      });
      return NextResponse.json({
        success: true,
        flagged: true,
        message:
          "आपने जो लिखा है, उससे लगता है कि आप किसी कठिन भावनात्मक स्थिति से गुज़र रहे हैं। यह जानकारी रिपोर्ट में उपयोग नहीं की जाएगी। कृपया किसी से बात करें — आप अकेले नहीं हैं।",
        resources: SUPPORT_RESOURCES_HI,
      });
    }

    const features = extractNarrativeFeatures(text);
    saveNarrativeSubmission({
      sessionId,
      rawText: text,
      featuresJson: JSON.stringify(features),
      safetyFlagged: false,
    });

    return NextResponse.json({ success: true, flagged: false, features });
  } catch (err) {
    console.error("[api/karma-mirror/narrative] error:", err);
    return NextResponse.json({ success: false, error: "सहेजने में त्रुटि" }, { status: 400 });
  }
}
