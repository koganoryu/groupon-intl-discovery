import Fuse from "fuse.js";
import type { Deal } from "./deals";

// ---------------------------------------------------------------------------
// The "matching gap" problem: the legacy engine does exact-match against
// localized deal titles. "Crossfit" never appears in a German title string
// ("Fitnessstudio Mitgliedschaft"), so it returns 0 results even though we
// clearly sell gym memberships. This module maps multilingual query intent
// to the category_l2 taxonomy the inventory is actually organized around.
// ---------------------------------------------------------------------------

export const CATEGORY_LABELS: Record<string, string> = {
  fitness: "Health & Fitness",
  beauty: "Beauty & Wellness",
  massage: "Beauty & Wellness",
  dining: "Food & Drink",
  activities: "Things To Do",
};

// category_l2 -> multilingual keyword bank (EN/DE/FR/ES/PL)
const SYNONYMS: Record<string, string[]> = {
  fitness: [
    "fitness", "gym", "gyms", "workout", "crossfit", "cross fit", "training",
    "personal trainer", "personal training", "exercise", "weights", "cardio",
    "spinning", "sport club",
    "fitnessstudio", "kraftraum", "mitgliedschaft", "sportstudio",
    "musculation", "salle de sport", "coaching", "entrainement", "entraînement", "forme",
    "gimnasio", "entrenamiento", "ejercicio", "pesas",
    "silownia", "siłownia", "trening", "cwiczenia", "ćwiczenia", "karnet",
  ],
  beauty: [
    "hair", "haircut", "hair cut", "hairdresser", "hairstyling", "hair styling",
    "salon", "beauty", "manicure", "pedicure", "nails", "facial", "styling", "barber",
    "friseur", "haare", "haarschnitt", "kosmetik", "maniküre", "maniküre", "pediküre", "gesichtsbehandlung",
    "coiffeur", "coiffure", "coupe", "beaute", "beauté", "manucure", "pedicure", "pédicure", "soin du visage", "ongles",
    "peluqueria", "peluquería", "pelo", "corte de pelo", "belleza", "manicura", "pedicura", "unas", "uñas",
    "fryzjer", "wlosy", "włosy", "uroda", "zabieg na twarz",
  ],
  massage: [
    "massage", "spa", "wellness", "relax", "relaxation", "therapy", "masseuse",
    "entspannung", "wohlfuhl", "wohlfühl",
    "bien-etre", "bien-être", "detente", "détente", "relaxant",
    "masaje", "bienestar", "relajacion", "relajación",
    "masaz", "masaż", "relaks",
  ],
  dining: [
    "restaurant", "dinner", "food", "tasting menu", "wine", "dining", "meal",
    "eat", "eating out", "cuisine", "supper", "lunch",
    "abendessen", "essen", "menu", "menü", "wein", "degustation",
    "diner", "dîner", "repas", "vin", "degustation", "dégustation", "gastronomie",
    "restaurante", "cena", "comida", "vino", "degustacion", "degustación",
    "restauracja", "kolacja", "jedzenie", "wino", "degustacja",
  ],
  activities: [
    "things to do", "activity", "activities", "bowling", "escape room",
    "karting", "go-kart", "go kart", "kart", "tour", "sightseeing", "city tour",
    "guided tour", "fun", "entertainment", "bolera", "bowling alley",
    "aktivitat", "aktivität", "unternehmungen", "kartbahn", "stadtfuhrung", "stadtführung",
    "activite", "activité", "jeu d'evasion", "jeu d'évasion", "visite guidee", "visite guidée", "sortie",
    "actividad", "kartodrom", "escape", "tour guiado", "visita guiada",
    "aktywnosc", "aktywność", "kregle", "kręgle", "gra w pokoju zagadek", "zwiedzanie", "przewodnik",
  ],
};

// Inventory gap: adventure/extreme-sports demand we simply don't carry, in
// every market. These must always resolve to the honest zero-result state,
// never to a fuzzy category match.
const ADVENTURE_KEYWORDS = [
  "rafting", "wildwasser", "aguas bravas", "eaux vives", "riviere", "rivière", "splyw", "spływ",
  "skydiving", "skydive", "sky diving", "fallschirmspringen", "paracaidismo", "parachutisme",
  "saut en parachute", "parachute", "parachuting", "skoki spadochronowe", "spadochron",
  "helicopter", "helicoptero", "helicóptero", "hubschrauber", "helikopter", "helicoptere", "hélicoptère",
  "hot air balloon", "heissluftballon", "heißluftballon", "montgolfiere", "montgolfière",
  "globo aerostatico", "globo aerostático", "balon", "lot balonem",
  "bungee", "bungee jumping", "paragliding", "parapente", "parasailing", "zipline", "zip line",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Substring matching alone lets short keywords match inside unrelated words
// (e.g. "eat" inside "retreat"). Require the match to sit on a word boundary.
function wordBoundaryIncludes(haystack: string, needle: string): boolean {
  if (!needle) return false;
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(needle)}([^a-z0-9]|$)`);
  return pattern.test(haystack);
}

function containsToken(haystack: string, needle: string): boolean {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return false;
  return wordBoundaryIncludes(h, n) || (n.length >= 3 && wordBoundaryIncludes(n, h));
}

export interface SearchReasoning {
  originalQuery: string;
  normalizedQuery: string;
  matchedCategoryL2: string | null;
  matchedCategoryL1: string | null;
  matchedKeyword: string | null;
  confidence: number; // 0-100
  matchMethod: "keyword" | "fuzzy" | "none" | "adventure";
  candidatePoolSize: number;
  legacyExactMatchCount: number;
}

export interface SearchOutcome {
  results: Deal[];
  reasoning: SearchReasoning;
  isAdventureGap: boolean;
  isMatchingGap: boolean;
}

function rankAndCurate(deals: Deal[]): Deal[] {
  const sorted = [...deals].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.numRatings - a.numRatings;
  });
  return sorted.slice(0, 10);
}

function legacyExactMatches(deals: Deal[], query: string): number {
  const q = normalize(query);
  if (!q) return 0;
  return deals.filter((d) => normalize(d.title).includes(q)).length;
}

export function runSearch(
  allDeals: Deal[],
  query: string,
  market: string | null,
  city: string | null,
): SearchOutcome {
  const scoped = allDeals.filter(
    (d) => (!market || d.market === market) && (!city || d.city === city),
  );

  const trimmed = query.trim();
  const normalizedQuery = normalize(trimmed);
  const legacyCount = legacyExactMatches(scoped, trimmed);

  // Empty query: browse mode, top-rated across scope.
  if (!trimmed) {
    return {
      results: rankAndCurate(scoped),
      reasoning: {
        originalQuery: trimmed,
        normalizedQuery: "",
        matchedCategoryL2: null,
        matchedCategoryL1: null,
        matchedKeyword: null,
        confidence: 100,
        matchMethod: "none",
        candidatePoolSize: scoped.length,
        legacyExactMatchCount: legacyCount,
      },
      isAdventureGap: false,
      isMatchingGap: false,
    };
  }

  // 1. Inventory gap check — adventure/extreme sports we never carry.
  const adventureHit = ADVENTURE_KEYWORDS.find((kw) => containsToken(normalizedQuery, kw));
  if (adventureHit) {
    return {
      results: [],
      reasoning: {
        originalQuery: trimmed,
        normalizedQuery,
        matchedCategoryL2: null,
        matchedCategoryL1: null,
        matchedKeyword: adventureHit,
        confidence: 97,
        matchMethod: "adventure",
        candidatePoolSize: 0,
        legacyExactMatchCount: legacyCount,
      },
      isAdventureGap: true,
      isMatchingGap: false,
    };
  }

  // 2. Keyword / synonym match against category_l2 taxonomy.
  let bestCategory: string | null = null;
  let bestKeyword: string | null = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(SYNONYMS)) {
    for (const kw of keywords) {
      const kwNorm = normalize(kw);
      if (normalizedQuery === kwNorm) {
        if (100 > bestScore) {
          bestScore = 100;
          bestCategory = category;
          bestKeyword = kw;
        }
      } else if (
        wordBoundaryIncludes(normalizedQuery, kwNorm) ||
        (normalizedQuery.length >= 3 && wordBoundaryIncludes(kwNorm, normalizedQuery))
      ) {
        const score = 80 + Math.min(15, kwNorm.length);
        if (score > bestScore) {
          bestScore = score;
          bestCategory = category;
          bestKeyword = kw;
        }
      }
    }
  }

  if (bestCategory) {
    let candidates = scoped.filter((d) => d.categoryL2 === bestCategory);
    // If a city filter starves the result set below the healthy floor,
    // widen to the whole market so we can still land in the 4-10 sweet spot.
    if (candidates.length < 4 && city) {
      candidates = allDeals.filter(
        (d) => (!market || d.market === market) && d.categoryL2 === bestCategory,
      );
    }
    const confidence = Math.min(98, Math.round(bestScore));
    return {
      results: rankAndCurate(candidates),
      reasoning: {
        originalQuery: trimmed,
        normalizedQuery,
        matchedCategoryL2: bestCategory,
        matchedCategoryL1: CATEGORY_LABELS[bestCategory],
        matchedKeyword: bestKeyword,
        confidence,
        matchMethod: "keyword",
        candidatePoolSize: candidates.length,
        legacyExactMatchCount: legacyCount,
      },
      isAdventureGap: false,
      isMatchingGap: false,
    };
  }

  // 3. Fuzzy fallback across titles in scope (typos, unmapped phrasing).
  const fuse = new Fuse(scoped, {
    keys: ["title"],
    threshold: 0.4,
    includeScore: true,
  });
  const fuzzyHits = fuse.search(trimmed);

  if (fuzzyHits.length > 0) {
    const top = fuzzyHits[0];
    const inferredCategory = top.item.categoryL2;
    const candidates = fuzzyHits
      .filter((h) => h.item.categoryL2 === inferredCategory)
      .map((h) => h.item);
    const confidence = Math.round((1 - (top.score ?? 0.5)) * 70);
    return {
      results: rankAndCurate(candidates),
      reasoning: {
        originalQuery: trimmed,
        normalizedQuery,
        matchedCategoryL2: inferredCategory,
        matchedCategoryL1: CATEGORY_LABELS[inferredCategory],
        matchedKeyword: null,
        confidence: Math.max(30, confidence),
        matchMethod: "fuzzy",
        candidatePoolSize: candidates.length,
        legacyExactMatchCount: legacyCount,
      },
      isAdventureGap: false,
      isMatchingGap: false,
    };
  }

  // 4. Nothing at all — honest "matching gap" zero-result state.
  return {
    results: [],
    reasoning: {
      originalQuery: trimmed,
      normalizedQuery,
      matchedCategoryL2: null,
      matchedCategoryL1: null,
      matchedKeyword: null,
      confidence: 0,
      matchMethod: "none",
      candidatePoolSize: 0,
      legacyExactMatchCount: legacyCount,
    },
    isAdventureGap: false,
    isMatchingGap: true,
  };
}
