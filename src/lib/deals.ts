import fs from "node:fs";
import path from "node:path";
import type { Market } from "./markets";

export type { Market } from "./markets";

export interface Deal {
  dealId: string;
  market: Market;
  city: string;
  title: string;
  categoryL1: string;
  categoryL2: string;
  priceUsd: number;
  rating: number;
  numRatings: number;
  isBookable: boolean;
}

function parseCsvLine(line: string): string[] {
  return line.split(",");
}

let cache: Deal[] | null = null;

export function loadDeals(): Deal[] {
  if (cache) return cache;

  const csvPath = path.join(process.cwd(), "public", "deals.csv");
  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.trim().split("\n");
  const [, ...rows] = lines;

  cache = rows.map((line) => {
    const [
      dealId,
      market,
      city,
      title,
      categoryL1,
      categoryL2,
      priceUsd,
      rating,
      numRatings,
      isBookable,
    ] = parseCsvLine(line);

    return {
      dealId,
      market: market as Market,
      city,
      title,
      categoryL1,
      categoryL2,
      priceUsd: parseFloat(priceUsd),
      rating: parseFloat(rating),
      numRatings: parseInt(numRatings, 10),
      isBookable: isBookable.trim().toLowerCase() === "true",
    };
  });

  return cache;
}

export function citiesByMarket(deals: Deal[]): Record<Market, string[]> {
  const map = {} as Record<Market, string[]>;
  for (const d of deals) {
    if (!map[d.market]) map[d.market] = [];
    if (!map[d.market].includes(d.city)) map[d.market].push(d.city);
  }
  for (const market of Object.keys(map) as Market[]) {
    map[market].sort();
  }
  return map;
}
