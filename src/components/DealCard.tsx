import { CheckCircle2, Heart } from "lucide-react";
import type { Deal } from "@/lib/deals";
import StarRating from "./StarRating";

const CATEGORY_IMAGE: Record<string, string> = {
  massage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=250&fit=crop",
  beauty: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
  fitness: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
  dining: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop",
  activities: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=250&fit=crop",
};

// Deterministic per-deal "was" discount (30-55%) so prices don't shift on re-render.
function discountFor(dealId: string): number {
  let hash = 0;
  for (let i = 0; i < dealId.length; i++) {
    hash = (hash * 31 + dealId.charCodeAt(i)) >>> 0;
  }
  return 0.3 + (hash % 26) / 100;
}

export default function DealCard({ deal }: { deal: Deal }) {
  const image = CATEGORY_IMAGE[deal.categoryL2] ?? CATEGORY_IMAGE.activities;
  const discount = discountFor(deal.dealId);
  const originalPrice = Math.round((deal.priceUsd / (1 - discount)) * 100) / 100;
  const percentOff = Math.round((1 - deal.priceUsd / originalPrice) * 100);

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-32 w-full overflow-hidden bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={deal.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
          {deal.categoryL1}
        </span>
        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm">
          <Heart size={13} className="text-zinc-500" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <div className="text-[11px] font-medium text-zinc-400">{deal.city}</div>
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-tight text-zinc-900">
          {deal.title}
        </h3>
        <div className="flex items-center justify-between">
          <StarRating rating={deal.rating} numRatings={deal.numRatings} />
          {deal.isBookable && (
            <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-[#008329]">
              <CheckCircle2 size={10} />
              Bookable
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center gap-1.5 pt-1">
          <span className="text-xs text-zinc-400 line-through">${originalPrice.toFixed(2)}</span>
          <span className="text-base font-bold text-zinc-900">${deal.priceUsd.toFixed(2)}</span>
          <span className="ml-auto rounded bg-[#008329] px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{percentOff}%
          </span>
        </div>
      </div>
    </div>
  );
}
