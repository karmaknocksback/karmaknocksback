"use client";

import { parseArticleContent } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  content: string;
  contentEn?: string | null;
}

export default function ArticleBody({ content, contentEn }: Props) {
  const { lang } = useLanguage();
  const hiBlocks = parseArticleContent(content);

  // Use English content when available, but keep the Hindi version's
  // heading ids so the table-of-contents (built server-side from the
  // Hindi headings, since language preference isn't known at server
  // render time) still scrolls to the right place. Falls back to the
  // English block's own id if the structure doesn't line up exactly
  // (e.g. translation altered paragraph/heading count) rather than
  // crashing or misaligning silently.
  const showEnglish = lang === "en" && !!contentEn;
  const blocks = showEnglish
    ? parseArticleContent(contentEn!).map((enBlock, i) => ({
        ...enBlock,
        id: hiBlocks[i]?.id ?? enBlock.id,
      }))
    : hiBlocks;

  return (
    <div className="space-y-5">
      {blocks.map((block, i) =>
        block.type === "heading" ? (
          <h2
            key={i}
            id={block.id}
            className="font-display-hi text-2xl text-charcoal pt-4 scroll-mt-24"
          >
            {block.text}
          </h2>
        ) : (
          <p key={i} className="font-hindi text-charcoal/78 leading-relaxed">
            {block.text}
          </p>
        )
      )}
    </div>
  );
}
