import { SearchX } from "lucide-react";

const ADVENTURE_ALTERNATIVES = [
  "Escape Room Experience",
  "Go-Karting Session",
  "Guided City Tour",
];

const CATEGORY_SUGGESTIONS = [
  "Fitness",
  "Beauty & Hair",
  "Massage & Spa",
  "Dining",
  "Things To Do",
];

export function AdventureGapState({
  query,
  onSuggestion,
}: {
  query: string;
  onSuggestion: (value: string) => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-8 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
        <SearchX size={28} className="text-amber-600" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-zinc-900">
          We don&apos;t have &ldquo;{query}&rdquo; deals yet
        </h2>
        <p className="text-sm leading-relaxed text-zinc-500">
          Adventure &amp; extreme-sports inventory — rafting, skydiving, helicopter tours, hot
          air balloons — isn&apos;t sold on Groupon in any of our 5 markets today. This is an
          honest gap, not a broken search: about 45% of zero-result searches are requests for
          categories we simply don&apos;t carry.
        </p>
      </div>
      <div className="w-full space-y-2 rounded-xl bg-white p-4 text-left shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Closest available alternatives
        </p>
        <div className="flex flex-wrap gap-2">
          {ADVENTURE_ALTERNATIVES.map((alt) => (
            <button
              key={alt}
              onClick={() => onSuggestion(alt)}
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-[#008329] hover:text-[#008329]"
            >
              {alt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MatchingGapState({
  query,
  onSuggestion,
}: {
  query: string;
  onSuggestion: (value: string) => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-8 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <SearchX size={28} className="text-red-500" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-zinc-900">
          No confident match for &ldquo;{query}&rdquo;
        </h2>
        <p className="text-sm leading-relaxed text-zinc-500">
          We couldn&apos;t map this query to a category with enough confidence to show results.
          This is the &ldquo;matching gap&rdquo; — the query is real demand, but the search
          engine and the localized inventory titles never connect.
        </p>
      </div>
      <div className="w-full space-y-2 rounded-xl bg-white p-4 text-left shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Browse a category instead
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_SUGGESTIONS.map((cat) => (
            <button
              key={cat}
              onClick={() => onSuggestion(cat)}
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-[#008329] hover:text-[#008329]"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
