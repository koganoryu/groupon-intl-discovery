import { MARKETS, type Market } from "@/lib/markets";

export default function MarketSelector({
  market,
  city,
  cities,
  onMarketChange,
  onCityChange,
}: {
  market: Market;
  city: string | null;
  cities: string[];
  onMarketChange: (m: Market) => void;
  onCityChange: (c: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={market}
        onChange={(e) => onMarketChange(e.target.value as Market)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-[#008329] focus:ring-1 focus:ring-[#008329]"
      >
        {MARKETS.map((m) => (
          <option key={m.code} value={m.code}>
            {m.flag} {m.code} · {m.label}
          </option>
        ))}
      </select>

      <select
        value={city ?? ""}
        onChange={(e) => onCityChange(e.target.value || null)}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-[#008329] focus:ring-1 focus:ring-[#008329]"
      >
        <option value="">All cities</option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
