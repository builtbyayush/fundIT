const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function hostnameWithoutWww(hostname: string): string {
  return hostname.replace(/^www\./i, "").toLowerCase();
}

/**
 * Extracts a YouTube video ID from common watch/share URLs.
 * Returns null for anything that is not a recognized YouTube URL.
 */
export function parseYoutubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  const host = hostnameWithoutWww(parsed.hostname);

  if (host === "youtu.be") {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch" || parsed.pathname === "/watch/") {
      const id = parsed.searchParams.get("v");
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }
    const embedMatch = parsed.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})\/?$/);
    if (embedMatch?.[1]) return embedMatch[1];
  }

  return null;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
