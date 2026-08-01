import { Star, StarHalf } from "lucide-react";

export default function StarRating({
  rating,
  numRatings,
}: {
  rating: number;
  numRatings: number;
}) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const roundsUp = rating - full >= 0.75;
  const fullCount = roundsUp ? full + 1 : full;
  const empty = 5 - fullCount - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-500">
        {Array.from({ length: fullCount }).map((_, i) => (
          <Star key={`f${i}`} size={14} fill="currentColor" strokeWidth={0} />
        ))}
        {hasHalf && <StarHalf size={14} fill="currentColor" strokeWidth={0} />}
        {Array.from({ length: Math.max(0, empty) }).map((_, i) => (
          <Star key={`e${i}`} size={14} className="text-zinc-300" />
        ))}
      </div>
      <span className="text-xs font-semibold text-zinc-700">{rating.toFixed(1)}</span>
      <span className="text-xs text-zinc-400">({numRatings})</span>
    </div>
  );
}
