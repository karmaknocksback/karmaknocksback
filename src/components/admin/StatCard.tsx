import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold-deep">
          <Icon size={18} />
        </span>
        <span className="font-display text-3xl text-charcoal">{value}</span>
      </div>
      <p className="font-hindi text-sm text-charcoal/60 mt-3">{label}</p>
    </div>
  );
}
