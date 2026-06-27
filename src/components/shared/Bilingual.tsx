"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  hi: string;
  en?: string | null;
  as?: "span" | "p" | "div";
  className?: string;
}

/**
 * Renders Hindi or English text depending on the active language —
 * for use inside server components (jap detail pages, article pages,
 * Jaap Directory item pages) where the language preference can't be
 * read server-side, since it lives in client-side localStorage.
 *
 * Falls back to Hindi if `en` is empty/null, which happens whenever a
 * field hasn't been through `npm run translate:content` yet — so
 * partial translation coverage degrades gracefully (shows Hindi) rather
 * than showing a blank.
 */
export default function Bilingual({ hi, en, as = "span", className }: Props) {
  const { lang } = useLanguage();
  const text = lang === "en" && en ? en : hi;
  const Tag = as;
  return <Tag className={className}>{text}</Tag>;
}
