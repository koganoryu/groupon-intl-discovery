import { CheckCircle2, Heart } from "lucide-react";
import type { Deal } from "@/lib/deals";
import StarRating from "./StarRating";

const CATEGORY_PHOTO_IDS: Record<string, string[]> = {
  massage: [
    "photo-1544161515-4ab6ce6db874",
    "photo-1519823551278-64ac92734fb1",
    "photo-1600334129128-685c5582fd35",
    "photo-1590439471364-192aa70c0b53",
  ],
  beauty: [
    "photo-1560066984-138dadb4c035",
    "photo-1522335789203-aabd1fc54bc9",
    "photo-1487412947147-5cebf100ffc2",
    "photo-1580618672591-eb180b1a973f",
  ],
  fitness: [
    "photo-1571019613454-1cb2f99b2d8b",
    "photo-1517836357463-d25dfeac3438",
    "photo-1540497077202-7c8a3999166f",
    "photo-1552674605-db6ffd4facb5",
  ],
  dining: [
    "photo-1517248135467-4c7edcad34c4",
    "photo-1414235077428-338989a2e8c0",
    "photo-1466978913421-dad2ebd01d17",
    "photo-1424847651672-bf20a4b0982b",
  ],
  activities: [
    "photo-1530549387789-4c1017266635",
    "photo-1553481187-be93c21490a9",
    "photo-1449824913935-59a10b8d2000",
    "photo-1511882150382-421056c89033",
  ],
};

const CATEGORY_IMAGES: Record<string, string[]> = Object.fromEntries(
  Object.entries(CATEGORY_PHOTO_IDS).map(([category, ids]) => [
    category,
    ids.map((id) => `https://images.unsplash.com/${id}?w=400&h=250&fit=crop`),
  ]),
);

// Deterministic hash (FNV-1a + avalanche finalizer) so the same deal always
// resolves to the same photo and discount, with well-mixed bits so nearby
// deal IDs (D00108, D00109, ...) don't cluster onto the same photo index.
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

function discountFor(hash: number): number {
  return 0.3 + ((hash >>> 8) % 26) / 100;
}

export default function DealCard({ deal }: { deal: Deal }) {
  const images = CATEGORY_IMAGES[deal.categoryL2] ?? CATEGORY_IMAGES.activities;
  const hash = hashString(deal.dealId);
  const image = images[hash % images.length];
  const discount = discountFor(hash);
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
