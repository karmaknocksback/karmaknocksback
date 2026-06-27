import type { KashayaTrait, KMPracticeCategory, TimelineEventType, LifeStage, ResolutionStatus } from "@/types";

export const KASHAYA_TRAITS: KashayaTrait[] = ["krodh", "maan", "maya", "lobh", "bhaya", "moh"];

export const TRAIT_LABELS_HI: Record<KashayaTrait, string> = {
  krodh: "क्रोध",
  maan: "मान",
  maya: "माया",
  lobh: "लोभ",
  bhaya: "भय",
  moh: "मोह",
};

export const TRAIT_LABELS_EN: Record<KashayaTrait, string> = {
  krodh: "Anger",
  maan: "Ego / Pride",
  maya: "Deceit / Self-deception",
  lobh: "Greed / Attachment to gain",
  bhaya: "Fear",
  moh: "Attachment / Delusion",
};

export const TRAIT_SHORT_DESCRIPTION_HI: Record<KashayaTrait, string> = {
  krodh: "किसी बात पर तुरंत भड़क उठने और प्रतिक्रिया में चोट पहुँचाने की प्रवृत्ति।",
  maan: "अपनी छवि, सम्मान और 'सही' दिखने की आवश्यकता से प्रेरित प्रवृत्ति।",
  maya: "स्वयं या दूसरों से सच्चाई छिपाने, बहाने बनाने या भूमिका निभाने की प्रवृत्ति।",
  lobh: "पाने, जमा करने और कभी 'पर्याप्त' न मानने की प्रवृत्ति — धन, मान्यता या नियंत्रण में।",
  bhaya: "अनिश्चितता, हानि या अस्वीकृति के भय से जीवन के फैसले लेने की प्रवृत्ति।",
  moh: "लोगों, परिणामों या आत्म-छवि से इतना जुड़ जाना कि अलग होना असहनीय लगे।",
};

export const PRACTICE_CATEGORY_LABELS_HI: Record<KMPracticeCategory, string> = {
  mantra: "मंत्र",
  jap: "जाप",
  swadhyay: "स्वाध्याय",
  contemplation: "चिंतन",
  journaling: "जर्नलिंग",
  bhavana: "भावना",
  daily_ritual: "दैनिक अभ्यास",
};

export const TIMELINE_EVENT_TYPES: TimelineEventType[] = [
  "relationship", "betrayal", "loss_grief", "career", "health", "conflict", "other",
];

export const TIMELINE_EVENT_LABELS_HI: Record<TimelineEventType, string> = {
  relationship: "रिश्ता",
  betrayal: "विश्वासघात",
  loss_grief: "हानि / शोक",
  career: "करियर",
  health: "स्वास्थ्य संकट",
  conflict: "बड़ा टकराव",
  other: "अन्य",
};

export const LIFE_STAGES: LifeStage[] = ["childhood", "adolescence", "young_adult", "recent", "ongoing"];

export const LIFE_STAGE_LABELS_HI: Record<LifeStage, string> = {
  childhood: "बचपन",
  adolescence: "किशोरावस्था",
  young_adult: "युवावस्था",
  recent: "हाल ही में",
  ongoing: "लगातार चल रहा है",
};

export const RESOLUTION_STATUSES: ResolutionStatus[] = ["unresolved", "partially_resolved", "resolved"];

export const RESOLUTION_LABELS_HI: Record<ResolutionStatus, string> = {
  unresolved: "अब भी अनसुलझा",
  partially_resolved: "कुछ हद तक सुलझा",
  resolved: "सुलझ गया",
};

/** Shown before the assessment starts — sets honest expectations about what
 * this tool is and isn't. Every place Karma Mirror is introduced should
 * link back to this framing rather than restating it differently. */
export const KARMA_MIRROR_DISCLAIMER_HI =
  "Karma Mirror एक आत्म-चिंतन उपकरण है, जो जैन कर्म-सिद्धांत और मनोविज्ञान की अवधारणाओं से प्रेरित है। यह कोई चिकित्सीय, मानसिक स्वास्थ्य निदान या प्रमाणित मनोवैज्ञानिक परीक्षण नहीं है। परिणामों को आत्म-समझ के एक दृष्टिकोण के रूप में लें, अंतिम सत्य के रूप में नहीं। यदि आप किसी गंभीर भावनात्मक कठिनाई से गुज़र रहे हैं, तो कृपया किसी योग्य काउंसलर या चिकित्सक से सहायता लें।";
