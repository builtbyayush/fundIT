import { parseYoutubeVideoId, youtubeEmbedUrl } from "@/lib/media/youtube";

export type ProjectMediaItem =
  | { kind: "image"; src: string; alt: string }
  | { kind: "youtube"; id: string; embedUrl: string };

export function buildProjectMediaItems(input: {
  title: string;
  coverImage?: string | null;
  thumbnail?: string | null;
  gallery?: string[];
  video?: string | null;
}): ProjectMediaItem[] {
  const items: ProjectMediaItem[] = [];
  const seen = new Set<string>();

  const hero = input.coverImage || input.thumbnail || null;
  if (hero) {
    items.push({ kind: "image", src: hero, alt: `${input.title} cover` });
    seen.add(hero);
  }

  for (const url of input.gallery ?? []) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    items.push({
      kind: "image",
      src: url,
      alt: `${input.title} gallery image ${items.filter((item) => item.kind === "image").length + 1}`,
    });
  }

  const youtubeId = parseYoutubeVideoId(input.video);
  if (youtubeId) {
    items.push({
      kind: "youtube",
      id: youtubeId,
      embedUrl: youtubeEmbedUrl(youtubeId),
    });
  }

  return items;
}
