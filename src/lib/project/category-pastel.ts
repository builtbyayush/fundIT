import type { PastelTokenKey } from "@/lib/utils/theme";

const PASTEL_CYCLE: PastelTokenKey[] = [
  "lavender",
  "mint",
  "peach",
  "blue",
  "yellow",
  "pink",
];

/**
 * Maps a category slug to a Phase 1 pastel token.
 * Deterministic: same slug always gets the same pastel.
 */
export function pastelForCategorySlug(slug: string): PastelTokenKey {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return PASTEL_CYCLE[hash % PASTEL_CYCLE.length] ?? "lavender";
}

export const CATEGORY_PASTEL_CLASSES: Record<
  PastelTokenKey,
  { surface: string; foreground: string }
> = {
  pink: {
    surface: "bg-pastel-pink text-pastel-pink-foreground",
    foreground: "text-pastel-pink-foreground",
  },
  peach: {
    surface: "bg-pastel-peach text-pastel-peach-foreground",
    foreground: "text-pastel-peach-foreground",
  },
  yellow: {
    surface: "bg-pastel-yellow text-pastel-yellow-foreground",
    foreground: "text-pastel-yellow-foreground",
  },
  mint: {
    surface: "bg-pastel-mint text-pastel-mint-foreground",
    foreground: "text-pastel-mint-foreground",
  },
  blue: {
    surface: "bg-pastel-blue text-pastel-blue-foreground",
    foreground: "text-pastel-blue-foreground",
  },
  lavender: {
    surface: "bg-pastel-lavender text-pastel-lavender-foreground",
    foreground: "text-pastel-lavender-foreground",
  },
};

export const PASTEL_BADGE_VARIANT: Record<
  PastelTokenKey,
  "pastelPink" | "pastelPeach" | "pastelYellow" | "pastelMint" | "pastelBlue" | "pastelLavender"
> = {
  pink: "pastelPink",
  peach: "pastelPeach",
  yellow: "pastelYellow",
  mint: "pastelMint",
  blue: "pastelBlue",
  lavender: "pastelLavender",
};
