import { Sparkles, X } from "lucide-react";
import type { SearchReasoning } from "@/lib/search";
import { CATEGORY_LABELS } from "@/lib/search";

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-[#008329]" : value >= 40 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</span>
      <span className="text-right text-sm font-medium text-zinc-800">{value}</span>
    </div>
  );
}

const METHOD_LABEL: Record<SearchReasoning["matchMethod"], string> = {
  keyword: "Multilingual synonym match",
  fuzzy: "Fuzzy title match (Fuse.js)",
  adventure: "Inventory-gap detector",
  none: "No match",
};

export default function AIInspector({
  open,
  onClose,
  reasoning,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  reasoning: SearchReasoning;
  resultCount: number;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008329]/10">
              <Sparkles size={16} className="text-[#008329]" />
            </div>
            <h2 className="text-sm font-bold text-zinc-900">AI Search Inspector</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-1 rounded-xl border border-zinc-200 p-4">
          <Row label="Original query" value={reasoning.originalQuery || "(empty — browsing)"} />
          <Row label="Normalized" value={reasoning.normalizedQuery || "—"} />
          <Row label="Match method" value={METHOD_LABEL[reasoning.matchMethod]} />
          <Row
            label="Matched category"
            value={
              reasoning.matchedCategoryL2
                ? `${reasoning.matchedCategoryL1} › ${reasoning.matchedCategoryL2}`
                : "None"
            }
          />
          <Row label="Matched keyword" value={reasoning.matchedKeyword ?? "—"} />
          <Row label="Candidate pool" value={`${reasoning.candidatePoolSize} deals`} />
          <Row label="Curated to" value={`${resultCount} results`} />
        </div>

        <div className="mt-4 rounded-xl border border-zinc-200 p-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Confidence
            </span>
            <span className="text-sm font-bold text-zinc-900">{reasoning.confidence}%</span>
          </div>
          <ConfidenceBar value={reasoning.confidence} />
        </div>

        <div className="mt-4 rounded-xl bg-zinc-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Legacy engine vs. AI search
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Exact title match (legacy)</span>
            <span
              className={`font-bold ${
                reasoning.legacyExactMatchCount === 0 ? "text-red-500" : "text-zinc-800"
              }`}
            >
              {reasoning.legacyExactMatchCount} results
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-zinc-500">Semantic search (this app)</span>
            <span
              className={`font-bold ${
                resultCount > 0 ? "text-[#008329]" : "text-red-500"
              }`}
            >
              {resultCount} results
            </span>
          </div>
          {reasoning.legacyExactMatchCount === 0 && resultCount > 0 && (
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              This is the matching-gap fix: the legacy engine finds nothing because it only
              exact-matches localized titles. The synonym map resolves intent to{" "}
              <strong>{reasoning.matchedCategoryL2 ? CATEGORY_LABELS[reasoning.matchedCategoryL2] : "a category"}</strong>{" "}
              instead.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
