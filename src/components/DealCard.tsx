import { CheckCircle2, Dumbbell, Scissors, Sparkles, TicketPercent, UtensilsCrossed } from "lucide-react";
import type { Deal } from "@/lib/deals";
import StarRating from "./StarRating";

const CATEGORY_STYLE: Record<
  string,
  { gradient: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  fitness: { gradient: "from-orange-400 to-rose-500", icon: Dumbbell },
  beauty: { gradient: "from-pink-400 to-fuchsia-500", icon: Scissors },
  massage: { gradient: "from-violet-400 to-indigo-500", icon: Sparkles },
  dining: { gradient: "from-amber-400 to-orange-500", icon: UtensilsCrossed },
  activities: { gradient: "from-emerald-400 to-teal-500", icon: TicketPercent },
};

export default function DealCard({ deal }: { deal: Deal }) {
  const style = CATEGORY_STYLE[deal.categoryL2] ?? CATEGORY_STYLE.activities;
  const Icon = style.icon;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${style.gradient}`}
      >
        <Icon size={36} className="text-white/90" />
        <span className="absolute left-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
          {deal.categoryL1}
        </span>
        {deal.isBookable && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#008329]">
            <CheckCircle2 size={11} />
            Bookable
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="text-[11px] font-medium text-zinc-400">{deal.city}</div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
          {deal.title}
        </h3>
        <StarRating rating={deal.rating} numRatings={deal.numRatings} />
        <div className="mt-auto flex items-baseline gap-1 pt-1">
          <span className="text-lg font-bold text-zinc-900">${deal.priceUsd.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
