export type GarmentIconKind =
  | "shirt"
  | "tshirt"
  | "trousers"
  | "suit"
  | "dress"
  | "duvet"
  | "bedding"
  | "shoes"
  | "other";

export interface GarmentIconPalette {
  container: string;
  icon: string;
}

export const GARMENT_ICON_STYLES: Record<GarmentIconKind, GarmentIconPalette> = {
  shirt: {
    container:
      "bg-sky-500/12 border-sky-500/25 dark:bg-sky-400/15 dark:border-sky-400/30",
    icon: "text-sky-600 dark:text-sky-400",
  },
  tshirt: {
    container:
      "bg-cyan-500/12 border-cyan-500/25 dark:bg-cyan-400/15 dark:border-cyan-400/30",
    icon: "text-cyan-600 dark:text-cyan-400",
  },
  trousers: {
    container:
      "bg-indigo-500/12 border-indigo-500/25 dark:bg-indigo-400/15 dark:border-indigo-400/30",
    icon: "text-indigo-600 dark:text-indigo-400",
  },
  suit: {
    container:
      "bg-slate-600/12 border-slate-500/25 dark:bg-slate-400/15 dark:border-slate-400/30",
    icon: "text-slate-700 dark:text-slate-200",
  },
  dress: {
    container:
      "bg-rose-500/12 border-rose-500/25 dark:bg-rose-400/15 dark:border-rose-400/30",
    icon: "text-rose-600 dark:text-rose-400",
  },
  duvet: {
    container:
      "bg-violet-500/12 border-violet-500/25 dark:bg-violet-400/15 dark:border-violet-400/30",
    icon: "text-violet-600 dark:text-violet-400",
  },
  bedding: {
    container:
      "bg-emerald-500/12 border-emerald-500/25 dark:bg-emerald-400/15 dark:border-emerald-400/30",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  shoes: {
    container:
      "bg-amber-500/12 border-amber-500/25 dark:bg-amber-400/15 dark:border-amber-400/30",
    icon: "text-amber-600 dark:text-amber-400",
  },
  other: {
    container:
      "bg-primary/10 border-primary/25 dark:bg-primary/15 dark:border-primary/30",
    icon: "text-primary",
  },
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const KEYWORD_RULES: Array<{ kind: GarmentIconKind; pattern: RegExp }> = [
  {
    kind: "shoes",
    pattern:
      /\b(basket|baskets|sneaker|sneakers|chaussure|chaussures|botte|bottes|sandale|sandales|mocassin|soulier|viatu|kiatu|shoe|shoes)\b/,
  },
  {
    kind: "duvet",
    pattern: /\b(couette|duvet|couverture|blanketi|comforter|blanket)\b/,
  },
  {
    kind: "bedding",
    pattern:
      /\b(parure|drap|draps|literie|taie|oreiller|rideau|rideaux|nappe|serviette|shuka|bedding|sheet|towel|curtain)\b/,
  },
  {
    kind: "dress",
    pattern:
      /\b(robe|jupe|boubou|pagne|gauni|sketi|dress|gown|skirt)\b/,
  },
  {
    kind: "trousers",
    pattern:
      /\b(pantalon|jean|jeans|chino|short|bermuda|suruali|trouser|trousers|pants)\b/,
  },
  {
    kind: "suit",
    pattern:
      /\b(costume|veste|blazer|manteau|blouson|smoking|suti|koti|suit|jacket|coat)\b/,
  },
  {
    kind: "tshirt",
    pattern:
      /\b(t-shirt|tshirt|tee-shirt|maillot|debardeur|pull|sweat|tricot|hoodie|fulana|sweater)\b/,
  },
  {
    kind: "shirt",
    pattern: /\b(chemise|chemisier|polo|blouse|haut|shati|shirt)\b/,
  },
];

const CATEGORY_FALLBACK: Record<string, GarmentIconKind> = {
  tops: "shirt",
  bottoms: "trousers",
  suits: "suit",
  dresses: "dress",
  bedding: "bedding",
  shoes: "shoes",
};

export function resolveGarmentKind(
  name?: string | null,
  category?: string | null
): GarmentIconKind {
  if (name) {
    const normalized = normalizeText(name);
    for (const rule of KEYWORD_RULES) {
      if (rule.pattern.test(normalized)) {
        return rule.kind;
      }
    }
  }

  if (category) {
    const normalizedCat = normalizeText(category);
    if (normalizedCat in CATEGORY_FALLBACK) {
      return CATEGORY_FALLBACK[normalizedCat];
    }
  }

  return "other";
}
