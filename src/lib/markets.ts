export type Market = "GB" | "DE" | "FR" | "ES" | "PL";

export const MARKETS: { code: Market; label: string; flag: string }[] = [
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "ES", label: "Spain", flag: "🇪🇸" },
  { code: "PL", label: "Poland", flag: "🇵🇱" },
];
