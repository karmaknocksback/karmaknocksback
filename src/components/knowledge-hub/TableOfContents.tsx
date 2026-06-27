import type { ContentHeading } from "@/lib/content";

export default function TableOfContents({ headings }: { headings: ContentHeading[] }) {
  if (!headings.length) return null;

  return (
    <nav className="glass-card rounded-2xl p-5 sticky top-24">
      <p className="font-hindi text-xs font-semibold uppercase tracking-wider text-gold-deep mb-3">
        विषय सूची
      </p>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="font-hindi text-sm text-charcoal/65 hover:text-gold-deep transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
