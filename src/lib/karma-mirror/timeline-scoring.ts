import type { KMTimelineEvent, TimelineEventType, ResolutionStatus, PrimaryScores, KashayaTrait } from "@/types";

/**
 * Timeline scoring is deterministic, rule-based math — no AI/LLM calls,
 * no external dependencies. It quantifies *how much weight* a person's
 * logged life events should carry, and *which* trait-relevant pattern (if
 * any) a given event plausibly connects to — checked against that
 * person's own actual trait scores, not applied as a fixed template.
 *
 * Important honesty boundary: this detects correlation/co-occurrence
 * (this person logged an unresolved betrayal AND scores high on moh), not
 * clinical causation. The report language built on top of this must keep
 * saying "this pattern often traces back to" rather than "this is why."
 */

const TYPE_WEIGHT: Record<TimelineEventType, number> = {
  betrayal: 1.0,
  loss_grief: 0.95,
  relationship: 0.85,
  health: 0.8,
  career: 0.7,
  conflict: 0.75,
  other: 0.6,
};

const RESOLUTION_MULTIPLIER: Record<ResolutionStatus, number> = {
  resolved: 0.5,
  partially_resolved: 0.8,
  unresolved: 1.2,
};

/** How much weight a single event should carry: severity (self-rated) ×
 * event-type weight × resolution multiplier. Scaled 0-100. An unresolved
 * severe betrayal scores far higher than a resolved mild conflict, by
 * design — resolution status matters more than recency alone. */
export function eventImpactScore(e: Pick<KMTimelineEvent, "severity" | "eventType" | "resolutionStatus">): number {
  const severityNorm = e.severity / 5;
  const raw = severityNorm * TYPE_WEIGHT[e.eventType] * RESOLUTION_MULTIPLIER[e.resolutionStatus];
  return Math.round(Math.min(1, raw) * 100);
}

/** Aggregate timeline weight across all logged events. Dominated by the
 * highest-impact events rather than diluted by averaging against many
 * minor ones — a couple of severe unresolved events should outweigh five
 * mild resolved ones, not get averaged down by them. */
export function timelineScore(events: KMTimelineEvent[]): number {
  if (!events.length) return 0;
  const impacts = events.map(eventImpactScore).sort((a, b) => b - a);
  const top = impacts.slice(0, 3); // top 3 events dominate the aggregate
  const weighted = top.reduce((sum, score, i) => sum + score * (1 - i * 0.25), 0);
  const maxPossible = top.reduce((sum, _, i) => sum + 100 * (1 - i * 0.25), 0);
  return Math.round((weighted / maxPossible) * 100);
}

/** How entrenched (vs situational) a pattern looks: events whose type
 * plausibly connects to the person's dominant trait, weighted UP for
 * spread across multiple life stages (recurring across decades suggests
 * an entrenched pattern) and weighted DOWN for clustering in one stage
 * (suggests a situational reaction, not a long-running loop). */
export function patternPersistenceScore(
  events: KMTimelineEvent[],
  dominantTrait: KashayaTrait
): number {
  const relevant = events.filter((e) => eventTypeConnectsToTrait(e.eventType, dominantTrait));
  if (!relevant.length) return 0;

  const distinctStages = new Set(relevant.map((e) => e.lifeStage)).size;
  const spreadBonus = Math.min(1, distinctStages / 3); // 3+ stages = fully entrenched
  const baseScore = Math.min(1, relevant.length / events.length);

  return Math.round(((baseScore * 0.5) + (spreadBonus * 0.5)) * 100);
}

/** Candidate event-type → trait connections, used only to decide whether
 * an event is *plausibly* relevant to a trait before checking it against
 * the person's actual scores — never applied as a fixed "betrayal always
 * means distrust" template for everyone. */
const EVENT_TRAIT_CANDIDATES: Record<TimelineEventType, KashayaTrait[]> = {
  betrayal: ["moh", "bhaya", "krodh"],
  loss_grief: ["moh", "bhaya"],
  relationship: ["moh", "bhaya", "maya"],
  career: ["maan", "lobh", "bhaya"],
  health: ["bhaya", "moh"],
  conflict: ["krodh", "maan"],
  other: [],
};

function eventTypeConnectsToTrait(eventType: TimelineEventType, trait: KashayaTrait): boolean {
  return EVENT_TRAIT_CANDIDATES[eventType]?.includes(trait) ?? false;
}

export interface CausalChainCandidate {
  event: KMTimelineEvent;
  trait: KashayaTrait;
  confidence: number; // 0-1
}

/** Builds candidate causal chains by checking each event's plausible
 * trait connections against this specific person's actual trait scores —
 * a betrayal event paired with someone whose moh/bhaya scores are
 * actually low does NOT get a forced "led to distrust" chain. Chains
 * below the confidence threshold are omitted entirely rather than
 * included with a low score, since a barely-plausible chain in a report
 * reads as confident insight regardless of the number behind it. */
const CONFIDENCE_THRESHOLD = 0.45;

export function buildCausalChains(
  events: KMTimelineEvent[],
  scores: PrimaryScores
): CausalChainCandidate[] {
  const candidates: CausalChainCandidate[] = [];

  for (const event of events) {
    const candidateTraits = EVENT_TRAIT_CANDIDATES[event.eventType];
    for (const trait of candidateTraits) {
      const traitScore = scores[trait] / 100; // 0-1
      const impact = eventImpactScore(event) / 100; // 0-1
      // Confidence is high only when BOTH the event was impactful AND the
      // person's actual score on that trait is elevated — neither alone
      // is enough to claim a connection.
      const confidence = traitScore * 0.6 + impact * 0.4;
      if (confidence >= CONFIDENCE_THRESHOLD && traitScore >= 0.5) {
        candidates.push({ event, trait, confidence: Math.round(confidence * 100) / 100 });
      }
    }
  }

  return candidates.sort((a, b) => b.confidence - a.confidence);
}
