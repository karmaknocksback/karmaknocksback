import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export default function GlassCard({
  children,
  className,
  glow = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "glass-card rounded-2xl transition-all duration-300",
        glow && "gold-glow",
        className
      )}
    >
      {children}
    </div>
  );
}
