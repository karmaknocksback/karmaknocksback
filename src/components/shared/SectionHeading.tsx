import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10",
        align === "center" ? "text-center mx-auto max-w-2xl" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold-deep mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display-hi text-3xl sm:text-4xl text-charcoal leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="font-hindi mt-4 text-charcoal/70 text-base sm:text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
