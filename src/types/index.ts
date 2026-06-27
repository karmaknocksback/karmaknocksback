export interface FAQItem {
  question: string;
  answer: string;
}

export interface JapData {
  _id: string;
  title: string;
  titleHi: string;
  slug: string;
  category: string;
  planet?: string | null;
  purpose: string;
  durationMinutes: number;
  thumbnail: string;
  youtubeLink: string;
  audioUrl?: string;
  benefits: string[];
  bestFor: string[];
  lyrics: string;
  transliteration?: string;
  meaning: string;
  howToListen: string;
  faq: FAQItem[];
  seoKeyword: string;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string;
  purposeTags?: string[];
  granthReference?: string;
  sourceConfidence?: "verified" | "traditional" | "community";
  purposeEn?: string | null;
  titleEn?: string | null;
  meaningEn?: string | null;
  howToListenEn?: string | null;
  benefitsEn?: string[];
  bestForEn?: string[];
  views: number;
  featured: boolean;
  createdAt: string;
}

export interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail: string;
  excerpt: string;
  content: string;
  tags: string[];
  author: string;
  seoTitle?: string;
  metaDescription?: string;
  faq: FAQItem[];
  titleEn?: string | null;
  excerptEn?: string | null;
  contentEn?: string | null;
  createdAt: string;
}

export interface TestimonialData {
  _id: string;
  name: string;
  city: string;
  review: string;
  rating: number;
  photo?: string;
  approved: boolean;
  createdAt: string;
}

// ===== Karma Mirror =====

export type KashayaTrait = "krodh" | "maan" | "maya" | "lobh" | "bhaya" | "moh";

export interface KMQuestionOption {
  label: string;
  value: 1 | 2 | 3 | 4 | 5;
}

export interface KMQuestion {
  id: string; // stable string id, e.g. "krodh-d1", "moh-s2"
  trait: KashayaTrait;
  type: "direct" | "scenario";
  text: string;
  options: KMQuestionOption[];
  reverseScored?: boolean;
}

export type PrimaryScores = Record<KashayaTrait, number>;

export interface SecondaryScores {
  attachment: number;
  reactivity: number;
  avoidance: number;
  control: number;
  perfectionism: number;
  emotionalDependency: number;
  peoplePleasing: number;
  suppression: number;
  overthinking: number;
}

export interface KMArchetype {
  id: string;
  slug: string;
  nameHi: string;
  nameEn: string;
  dominantTraits: KashayaTrait[];
  description: string;
  strengths: string[];
  weaknesses: string[];
  karmicLoop: string;
  triggerMap: string[];
  healingPath: string;
  jainLens: string;
  psychLens: string;
}

export type TimelineEventType =
  | "relationship" | "betrayal" | "loss_grief" | "career" | "health" | "conflict" | "other";
export type LifeStage = "childhood" | "adolescence" | "young_adult" | "recent" | "ongoing";
export type ResolutionStatus = "unresolved" | "partially_resolved" | "resolved";

export interface KMTimelineEvent {
  id?: string;
  eventType: TimelineEventType;
  lifeStage: LifeStage;
  severity: 1 | 2 | 3 | 4 | 5;
  resolutionStatus: ResolutionStatus;
  note?: string;
}

export type KMPracticeCategory =
  | "mantra" | "jap" | "swadhyay" | "contemplation" | "journaling" | "bhavana" | "daily_ritual";
export type KMDifficulty = "beginner" | "intermediate" | "advanced";

export interface KMPractice {
  _id: string;
  practiceName: string;
  category: KMPracticeCategory;
  targetTraits: string[];
  durationMinutes?: number;
  difficulty: KMDifficulty;
  benefits: string[];
  instructionText?: string;
  linkedJapId?: string;
  linkedArticleId?: string;
}

export interface KMPracticeRecommendation {
  practice: KMPractice;
  matchScore: number;
  reason: string;
  linkedJapSlug?: string;
  linkedJapTitleHi?: string;
}

export interface KMReportSection {
  key: string;
  title: string;
  body: string; // markdown-ish plain text, rendered as paragraphs
}

export interface KMReport {
  sessionId: string;
  primaryScores: PrimaryScores;
  confidence: number; // 0-1
  reliability: number; // 0-1
  archetype: KMArchetype;
  secondaryArchetypeCandidates?: { archetype: KMArchetype; score: number }[];
  practices: KMPracticeRecommendation[];
  sections: KMReportSection[];
  kundli?: {
    ascendantRashiHi: string;
    moonRashiHi: string;
    sunRashiHi: string;
    moonNakshatraHi: string;
    moonNakshatraPada: number;
    planetPlacements: { planetHi: string; rashiHi: string; nakshatraHi: string }[];
    mahadashas: { lord: string; lordHi: string; startDate: string; endDate: string; isCurrent: boolean }[];
    calculationNote: string;
  };
  generatedBy: "template" | "ai-enhanced";
  createdAt: string;
}

export interface KMSession {
  id: string;
  status: "in_progress" | "completed";
  experienceLevel: KMDifficulty;
  name?: string;
  email?: string;
  reportUnlocked: boolean;
  createdAt: string;
  completedAt?: string;
}

