import { cn } from "@/lib/utils";

interface MalaDividerProps {
  beadCount?: number;
  className?: string;
}

/**
 * A row of small "beads" rendered as a divider, echoing the mala (rosary)
 * used to count jap repetitions (108 / 1008). This is the site's signature
 * structural device — used between sections instead of a generic hairline.
 */
export default function MalaDivider({ beadCount = 27, className }: MalaDividerProps) {
  const beads = Array.from({ length: beadCount });
  return (
    <div
      className={cn("flex items-center justify-center gap-[6px] py-2", className)}
      role="separator"
      aria-hidden="true"
    >
      {beads.map((_, i) => {
        const isCenter = i === Math.floor(beadCount / 2);
        return (
          <span
            key={i}
            className={cn(
              "rounded-full bg-gradient-to-br from-gold-soft to-gold-deep",
              isCenter ? "h-2.5 w-2.5 opacity-90" : "h-1.5 w-1.5 opacity-50"
            )}
          />
        );
      })}
    </div>
  );
}
