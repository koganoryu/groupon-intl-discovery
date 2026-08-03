"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import type { Deal, Market } from "@/lib/deals";
import { runSearch } from "@/lib/search";
import MarketSelector from "./MarketSelector";
import DealCard from "./DealCard";
import AIInspector from "./AIInspector";
import { AdventureGapState, MatchingGapState } from "./ZeroResultsState";

const QUICK_SEARCHES = ["Crossfit", "Peluquería", "Bowling", "Wine tasting", "Rafting"];
const SEARCH_DEBOUNCE_MS = 400;

export default function SearchApp({
  allDeals,
  citiesByMarket,
}: {
  allDeals: Deal[];
  citiesByMarket: Record<Market, string[]>;
}) {
  const [market, setMarket] = useState<Market>("GB");
  const [city, setCity] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const cities = citiesByMarket[market] ?? [];
  const isPending = query !== debouncedQuery;

  // Debounce so mid-typing states ("crossf") don't flash the zero-result
  // UI or a half-formed results grid before the user finishes typing.
  useEffect(() => {
    if (query === debouncedQuery) return;
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, debouncedQuery]);

  const outcome = useMemo(
    () => runSearch(allDeals, debouncedQuery, market, city),
    [allDeals, debouncedQuery, market, city],
  );

  function handleMarketChange(m: Market) {
    setMarket(m);
    setCity(null);
  }

  // Explicit selections (quick-search chips, zero-state suggestions, Enter)
  // search immediately instead of waiting out the debounce.
  function selectQuery(value: string) {
    setQuery(value);
    setDebouncedQuery(value);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-[#008329]">Groupon</span>
          <span className="text-sm font-medium text-zinc-400">AI Search Prototype</span>
        </div>
        <button
          onClick={() => setInspectorOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-[#008329]/30 bg-[#008329]/5 px-3 py-1.5 text-xs font-semibold text-[#008329] transition hover:bg-[#008329]/10"
        >
          <Sparkles size={14} />
          AI Inspector
        </button>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <MarketSelector
          market={market}
          city={city}
          cities={cities}
          onMarketChange={handleMarketChange}
          onCityChange={setCity}
        />

        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") selectQuery(query);
            }}
            placeholder="Try 'crossfit', 'peluquería', 'bowling'…"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-8 text-sm text-zinc-800 outline-none focus:border-[#008329] focus:ring-1 focus:ring-[#008329]"
          />
          {isPending && (
            <Loader2
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-zinc-300"
            />
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-zinc-400">Try:</span>
        {QUICK_SEARCHES.map((q) => (
          <button
            key={q}
            onClick={() => selectQuery(q)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              query === q
                ? "border-[#008329] bg-[#008329] text-white"
                : "border-zinc-200 text-zinc-600 hover:border-[#008329] hover:text-[#008329]"
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      <main className="flex-1">
        {isPending ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-zinc-400">
            <Loader2 size={16} className="animate-spin" />
            Searching…
          </div>
        ) : (
          <>
            {outcome.isAdventureGap && (
              <AdventureGapState query={debouncedQuery} onSuggestion={selectQuery} />
            )}

            {outcome.isMatchingGap && (
              <MatchingGapState query={debouncedQuery} onSuggestion={selectQuery} />
            )}

            {!outcome.isAdventureGap && !outcome.isMatchingGap && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-zinc-500">
                    Showing <span className="font-semibold text-zinc-800">{outcome.results.length}</span>{" "}
                    curated result{outcome.results.length === 1 ? "" : "s"}
                    {debouncedQuery.trim() && (
                      <>
                        {" "}
                        for &ldquo;<span className="font-medium text-zinc-700">{debouncedQuery}</span>&rdquo;
                      </>
                    )}
                  </p>
                  {outcome.results.length >= 4 && outcome.results.length <= 10 && (
                    <span className="text-xs font-medium text-[#008329]">
                      Sweet spot: 4–10 results ≈ 20.4% conversion
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {outcome.results.map((deal) => (
                    <DealCard key={deal.dealId} deal={deal} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <AIInspector
        open={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        reasoning={outcome.reasoning}
        resultCount={outcome.results.length}
      />
    </div>
  );
}
