export interface DisplayCategory {
  name: string;
  slug?: string;
  id?: string;
}

export function resolveProjectImage(
  thumbnail?: string | null,
  coverImage?: string | null,
): string | null {
  return coverImage || thumbnail || null;
}

export function resolveProjectCardImage(
  thumbnail?: string | null,
  coverImage?: string | null,
): string | null {
  return coverImage || thumbnail || null;
}

export function categoryDisplayLabels(categories: DisplayCategory[]): {
  labels: string[];
  more: number;
} {
  const labels = categories.slice(0, 2).map((category) => category.name);
  return { labels, more: Math.max(categories.length - labels.length, 0) };
}

export function formatProjectLocation(
  location: {
    city?: string;
    state?: string;
    country?: string;
  } | null | undefined,
): string | null {
  if (!location) return null;
  return [location.city, location.state, location.country].filter(Boolean).join(", ") || null;
}
