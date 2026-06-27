import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getSession, getAnswers, markSessionCompleted, getArchetypeRowIdBySlug, saveReport,
  getTimelineEvents, getNarrativeSubmission, getKundliProfile, listLiveQuestions,
} from "@/lib/repo/km-assessment";
import { computePrimaryScores, computeConfidence, computeReliability } from "@/lib/karma-mirror/scoring";
import { generateReport } from "@/lib/karma-mirror/report";
import { sendAcknowledgment } from "@/lib/email";
import { SITE } from "@/lib/constants";
import type { NarrativeFeatures } from "@/lib/karma-mirror/narrative";
import type { KundliPositions } from "@/lib/karma-mirror/kundli/ephemeris";

const schema = z.object({ sessionId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = schema.parse(body);

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "सत्र नहीं मिला" }, { status: 404 });
    }

    const answers = await getAnswers(sessionId);
    const questions = await listLiveQuestions();
    const minAnswersRequired = Math.ceil(questions.length * 0.5);
    if (answers.length < minAnswersRequired) {
      return NextResponse.json(
        { success: false, error: `कृपया कम से कम ${minAnswersRequired} प्रश्नों के उत्तर दें (अभी तक ${answers.length})` },
        { status: 400 }
      );
    }

    const primaryScores = computePrimaryScores(answers, questions);
    const confidence = computeConfidence(answers, questions);
    const reliability = computeReliability(answers, questions);

    const timelineEvents = await getTimelineEvents(sessionId);

    // Narrative features are only used if a submission exists AND it was
    // never safety-flagged — flagged submissions are excluded from
    // scoring entirely (see /api/karma-mirror/narrative).
    const narrativeRow = await getNarrativeSubmission(sessionId);
    let narrativeFeatures: NarrativeFeatures | undefined;
    if (narrativeRow && !narrativeRow.safety_flagged) {
      try {
        const parsed = JSON.parse(narrativeRow.features_json);
        if (!parsed.excludedFromScoring) narrativeFeatures = parsed;
      } catch {
        // malformed stored JSON — skip narrative section rather than fail the whole report
      }
    }

    const kundliProfile = await getKundliProfile(sessionId);
    const kundliPositions: KundliPositions | undefined = kundliProfile
      ? JSON.parse(kundliProfile.positions_json)
      : undefined;

    const report = await generateReport({
      sessionId,
      primaryScores,
      confidence,
      reliability,
      experienceLevel: session.experienceLevel,
      timelineEvents,
      narrativeFeatures,
      kundliPositions,
      kundliBirthDateISO: kundliProfile?.birth_date,
    });

    const archetypeRowId = await getArchetypeRowIdBySlug(report.archetype.slug);
    await saveReport(sessionId, {
      scoresJson: JSON.stringify(primaryScores),
      archetypeRowId,
      sectionsJson: JSON.stringify(report),
      generatedBy: report.generatedBy,
    });
    await markSessionCompleted(sessionId);

    if (session.email) {
      const reportUrl = `${SITE.url}/karma-mirror/results/${sessionId}`;
      await sendAcknowledgment({
        to: session.email,
        name: session.name || "साधक",
        title: "आपकी Karma Mirror रिपोर्ट तैयार है",
        bodyHtml: `
          <p style="color:#1a1a1a;font-size:14px;">आपका आर्किटाइप: <strong>${report.archetype.nameHi}</strong></p>
          <a href="${reportUrl}" style="display:inline-block;margin:14px 0;padding:11px 26px;background:linear-gradient(120deg,#9c7726,#c89b3c);color:#fff9f0;text-decoration:none;border-radius:999px;font-weight:600;">
            पूरी रिपोर्ट देखें
          </a>
          <p style="color:#1a1a1a;font-size:12px;">या यह लिंक खोलें: ${reportUrl}</p>
        `,
      });
    }

    return NextResponse.json({ success: true, report });
  } catch (err) {
    console.error("[api/karma-mirror/complete] error:", err);
    return NextResponse.json({ success: false, error: "रिपोर्ट बनाने में त्रुटि" }, { status: 400 });
  }
}
