/**
 * UI-chrome string dictionary. Covers navigation, footer, and common
 * repeated microcopy (buttons, labels) — NOT full page content. Jap
 * mantras, lyrics, and meanings are never translated here or anywhere
 * else in the app, by design (mantra text should stay exactly as-is
 * regardless of UI language).
 *
 * Honest scope note: this is the infrastructure + the highest-visibility
 * surfaces (nav, footer, language gate, home page hero). Full English
 * copy for every page (About, Services, Contact, Community, Knowledge
 * Hub articles, Karma Mirror flow, etc.) is a larger content-authoring
 * pass not done in this build — extending this dictionary with more keys
 * and using `useTranslation()` in additional components is the pattern
 * to continue it.
 */

export type Language = "hi" | "en";

export const STRINGS = {
  // Navbar
  nav_home: { hi: "होम", en: "Home" },
  nav_jap_library: { hi: "जाप लाइब्रेरी", en: "Jap Library" },
  nav_knowledge_hub: { hi: "ज्ञान केंद्र", en: "Knowledge Hub" },
  nav_karma_mirror: { hi: "Karma Mirror", en: "Karma Mirror" },
  nav_services: { hi: "सेवाएँ", en: "Services" },
  nav_community: { hi: "समुदाय", en: "Community" },
  nav_about: { hi: "परिचय", en: "About" },
  nav_contact: { hi: "संपर्क", en: "Contact" },

  // Language gate (first-visit prompt)
  language_gate_title: { hi: "अपनी पसंदीदा भाषा चुनें", en: "Choose your preferred language" },
  language_gate_subtitle: {
    hi: "साइट का अनुभव आपकी चुनी हुई भाषा में दिखेगा। जाप व मंत्र हमेशा मूल भाषा में ही रहेंगे।",
    en: "The site will display in your chosen language. Jaap mantras will always stay in their original language.",
  },
  language_gate_hindi: { hi: "हिंदी में जारी रखें", en: "हिंदी में जारी रखें" },
  language_gate_english: { hi: "Continue in English", en: "Continue in English" },

  // Common buttons / microcopy
  read_more: { hi: "और पढ़ें", en: "Read more" },
  search_placeholder: { hi: "जाप, समस्या या उद्देश्य खोजें...", en: "Search jaaps, problems, or purpose..." },
  no_results: { hi: "कोई जाप नहीं मिला। कृपया फ़िल्टर बदलकर पुनः प्रयास करें।", en: "No jaaps found. Try adjusting your search or filters." },
  loading: { hi: "लोड हो रहा है...", en: "Loading..." },
  view_all: { hi: "सभी देखें", en: "View all" },
  listen_now: { hi: "अभी सुनें", en: "Listen now" },

  // Footer
  footer_tagline: {
    hi: "प्रामाणिक जैन जाप, मंत्र व आध्यात्मिक मार्गदर्शन — एक स्थान पर।",
    en: "Authentic Jain jaaps, mantras, and spiritual guidance — all in one place.",
  },
  footer_quick_links: { hi: "त्वरित लिंक", en: "Quick Links" },
  footer_connect: { hi: "जुड़ें", en: "Connect" },
  footer_rights: { hi: "सर्वाधिकार सुरक्षित", en: "All rights reserved" },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Language): string {
  return STRINGS[key][lang];
}
