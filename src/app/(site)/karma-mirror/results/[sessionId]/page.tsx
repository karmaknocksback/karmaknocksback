import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Flame, Crown, Drama, Coins, CloudFog, Heart, Sparkles, ListChecks, Lock,
} from "lucide-react";
import { getReportRow, getSession } from "@/lib/repo/km-assessment";
import { TRAIT_LABELS_HI, KASHAYA_TRAITS } from "@/lib/karma-mirror/constants";
import GlassCard from "@/components/shared/GlassCard";
import ResultsSessionTracker from "@/components/karma-mirror/ResultsSessionTracker";
import ReportPaywall from "@/components/karma-mirror/ReportPaywall";
import ReportFeedback from "@/components/karma-mirror/ReportFeedback";
import type { KMReport, KashayaTrait } from "@/types";
import Link from "next/link";

export const metadata: Metadata = { title: "आपकी Karma Mirror रिपोर्ट", robots: { index: false } };

const TRAIT_ICONS: Record<KashayaTrait, typeof Flame> = {
  krodh: Flame, maan: Crown, maya: Drama, lobh: Coins, bhaya: CloudFog, moh: Heart,
};

const TRAIT_COLORS: Record<KashayaTrait, string> = {
  krodh: "#ef4444", maan: "#f59e0b", maya: "#8b5cf6",
  lobh: "#10b981", bhaya: "#6366f1", moh: "#ec4899",
};

function TraitBar({ trait, traitKey, score }: { trait: string; traitKey: KashayaTrait; score: number }) {
  const Icon = TRAIT_ICONS[traitKey];
  const color = TRAIT_COLORS[traitKey];
  const intensity = score >= 75 ? "उच्च" : score >= 45 ? "मध्यम" : "निम्न";
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 font-hindi text-sm font-medium text-charcoal/85">
          <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: `${color}22` }}>
            <Icon size={14} style={{ color }} />
          </span>
          {trait}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-hindi text-[10px] rounded-full px-2 py-0.5 border"
            style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
            {intensity}
          </span>
          <span className="font-sans text-xs text-charcoal/40 tabular-nums w-10 text-right">{score}/100</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-charcoal/6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
    </div>
  );
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const row = await getReportRow(sessionId);
  if (!row) notFound();
  const session = await getSession(sessionId);
  const unlocked = session?.reportUnlocked ?? false;

  const report = JSON.parse(row.sections_json) as KMReport;
  const dominantTrait = Object.entries(report.primaryScores).sort((a, b) => b[1] - a[1])[0][0] as KashayaTrait;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0f0500 0%, #1a0800 30%, #fff9f0 30%)" }}>
      <ResultsSessionTracker sessionId={sessionId} />

      {/* Dark hero section */}
      <div className="relative text-center px-5 pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(200,155,60,0.5), transparent 70%)" }} />

        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-gold opacity-60" />
            <span className="font-sans text-[11px] uppercase tracking-[0.35em] text-gold/70">Karma Mirror Report</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-gold opacity-60" />
          </div>

          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-40"
              style={{ background: TRAIT_COLORS[dominantTrait] }} />
            <div className="relative flex h-20 w-20 mx-auto items-center justify-center rounded-full border-2 border-gold/30"
              style={{ background: `linear-gradient(135deg, ${TRAIT_COLORS[dominantTrait]}33, #1a0800)` }}>
              {(() => { const Icon = TRAIT_ICONS[dominantTrait]; return <Icon size={32} className="text-gold" />; })()}
            </div>
          </div>

          <h1 className="font-display-hi text-4xl sm:text-5xl text-warm-white mb-2"
            style={{ textShadow: "0 0 60px rgba(200,155,60,0.3)" }}>
            {report.archetype.nameHi}
          </h1>
          <p className="font-sans text-sm text-gold/60 mb-5">{report.archetype.nameEn}</p>
          <p className="font-hindi text-warm-white/65 text-base leading-relaxed max-w-lg mx-auto">
            {report.archetype.description}
          </p>
        </div>
      </div>

      {/* Content on white background */}
      <div className="mx-auto max-w-2xl px-5 sm:px-8 pb-20 -mt-4 relative z-10 space-y-6">

        {/* Scores card */}
        <GlassCard glow className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-gold-deep" />
            <h2 className="font-display-hi text-xl text-charcoal">आपके कषाय स्कोर</h2>
          </div>
          {KASHAYA_TRAITS.map((t) => (
            <TraitBar key={t} trait={TRAIT_LABELS_HI[t]} traitKey={t} score={report.primaryScores[t]} />
          ))}
          <div className="mt-5 pt-5 border-t border-charcoal/8 flex gap-3 flex-wrap">
            <span className="font-hindi text-[11px] rounded-full bg-charcoal/5 px-3 py-1 text-charcoal/50">
              पूर्णता {Math.round(report.confidence * 100)}%
            </span>
            <span className="font-hindi text-[11px] rounded-full bg-charcoal/5 px-3 py-1 text-charcoal/50">
              आंतरिक संगति {Math.round(report.reliability * 100)}%
            </span>
          </div>
        </GlassCard>

        {/* Free practices preview */}
        <GlassCard className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <ListChecks size={18} className="text-gold-deep" />
            <h2 className="font-display-hi text-xl text-charcoal">अनुशंसित अभ्यास</h2>
          </div>
          <div className="space-y-4">
            {report.practices.slice(0, 2).map((rec, i) => (
              <div key={i} className="flex gap-3 pb-4 border-b border-charcoal/8 last:border-0 last:pb-0">
                <div className="shrink-0 w-7 h-7 rounded-full bg-gold/15 text-gold-deep font-hindi text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="font-hindi text-base font-medium text-charcoal">{rec.practice.practiceName}</p>
                  <p className="font-hindi text-xs text-charcoal/55 mt-1">{rec.reason}</p>
                  {rec.linkedJapSlug && (
                    <Link href={`/jap-library/${rec.linkedJapSlug}`} className="font-hindi text-xs text-gold-deep underline mt-1.5 inline-block">
                      जाप सुनें →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          {report.practices.length > 2 && !unlocked && (
            <div className="mt-4 flex items-center gap-2 text-charcoal/40">
              <Lock size={14} />
              <p className="font-hindi text-xs">+{report.practices.length - 2} और अभ्यास पूरी रिपोर्ट में</p>
            </div>
          )}
        </GlassCard>

        {/* PAYWALL or Full Report */}
        {unlocked ? (
          <FullReport report={report} sessionId={sessionId} />
        ) : (
          <ReportPaywall sessionId={sessionId} />
        )}

        <ReportFeedback sessionId={sessionId} />
      </div>
    </div>
  );
}

function FullReport({ report, sessionId }: { report: KMReport; sessionId: string }) {
  const SECTION_LABELS: Record<string, string> = {
    "trigger-map": "🎯 ट्रिगर मैप",
    "emotional-loop": "🔄 भावनात्मक लूप",
    "karmic-timeline": "📜 कर्मिक टाइमलाइन",
    "narrative-pattern": "💬 नैरेटिव पैटर्न",
    "kundli-reflection": "🌙 कुंडली प्रतिबिंब",
    "jain-reflection": "🌿 जैन दृष्टिकोण",
    "psych-interpretation": "🧠 मनोवैज्ञानिक व्याख्या",
    "healing-roadmap": "🧭 उपचार मार्ग",
    "practice-prescription": "📋 पूर्ण अभ्यास योजना",
  };
  const SKIP = new Set(["dominant-traits", "shadow-traits", "archetype"]);

  const sections = report.sections.filter(s => !SKIP.has(s.key));

  return (
    <>
      {report.kundli && (
        <GlassCard className="p-6 sm:p-8">
          <h2 className="font-display-hi text-xl text-charcoal mb-1">🌙 कुंडली विश्लेषण</h2>
          <p className="font-hindi text-xs text-charcoal/50 mb-5">
            लग्न: {report.kundli.ascendantRashiHi} · चंद्र: {report.kundli.moonRashiHi} · सूर्य: {report.kundli.sunRashiHi}
          </p>
          <div className="overflow-x-auto rounded-xl border border-charcoal/10 mb-5">
            <table className="w-full text-left">
              <thead className="bg-charcoal/[0.03]">
                <tr>
                  <th className="py-2.5 px-4 font-hindi text-xs text-charcoal/50">ग्रह</th>
                  <th className="py-2.5 px-4 font-hindi text-xs text-charcoal/50">राशि</th>
                  <th className="py-2.5 px-4 font-hindi text-xs text-charcoal/50">नक्षत्र</th>
                </tr>
              </thead>
              <tbody>
                {report.kundli.planetPlacements.map((p) => (
                  <tr key={p.planetHi} className="border-t border-charcoal/5">
                    <td className="py-2.5 px-4 font-hindi text-sm text-charcoal">{p.planetHi}</td>
                    <td className="py-2.5 px-4 font-hindi text-sm text-charcoal/70">{p.rashiHi}</td>
                    <td className="py-2.5 px-4 font-hindi text-sm text-charcoal/70">{p.nakshatraHi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {sections.map(section => (
        <GlassCard key={section.key} className="p-6 sm:p-8">
          <h2 className="font-display-hi text-xl text-charcoal mb-4">
            {SECTION_LABELS[section.key] || section.title}
          </h2>
          <div className="space-y-3">
            {section.body.split("\n\n").map((para, i) => (
              <p key={i} className="font-hindi text-sm text-charcoal/75 leading-relaxed">{para}</p>
            ))}
          </div>
        </GlassCard>
      ))}

      <div className="text-center pt-4">
        <Link href="/jap-library" className="font-hindi text-sm text-gold-deep underline">
          अपने पैटर्न के अनुसार जाप खोजें →
        </Link>
      </div>
    </>
  );
}
