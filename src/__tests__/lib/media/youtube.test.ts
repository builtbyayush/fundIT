import { describe, expect, it } from "vitest";

import { parseYoutubeVideoId, youtubeEmbedUrl } from "@/lib/media/youtube";
import { buildProjectMediaItems } from "@/lib/project/media";

describe("parseYoutubeVideoId", () => {
  it("parses watch URLs with and without www", () => {
    expect(parseYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
    expect(parseYoutubeVideoId("https://youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("parses youtu.be share URLs", () => {
    expect(parseYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for junk or non-YouTube URLs", () => {
    expect(parseYoutubeVideoId("not a url")).toBeNull();
    expect(parseYoutubeVideoId("https://vimeo.com/123456")).toBeNull();
    expect(parseYoutubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseYoutubeVideoId("javascript:alert(1)")).toBeNull();
    expect(parseYoutubeVideoId("https://youtube.com/watch?v=short")).toBeNull();
    expect(parseYoutubeVideoId(null)).toBeNull();
  });

  it("builds privacy-enhanced embed URLs only from IDs", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });
});

describe("buildProjectMediaItems", () => {
  it("dedupes the hero URL from the gallery and appends a parsed YouTube item", () => {
    const items = buildProjectMediaItems({
      title: "Lanterns",
      coverImage: "https://cdn.example/cover.jpg",
      gallery: [
        "https://cdn.example/cover.jpg",
        "https://cdn.example/extra.jpg",
      ],
      video: "https://youtu.be/dQw4w9WgXcQ",
    });

    expect(items).toEqual([
      { kind: "image", src: "https://cdn.example/cover.jpg", alt: "Lanterns cover" },
      {
        kind: "image",
        src: "https://cdn.example/extra.jpg",
        alt: "Lanterns gallery image 2",
      },
      {
        kind: "youtube",
        id: "dQw4w9WgXcQ",
        embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      },
    ]);
  });

  it("does not treat an unrecognized video URL as an image or embed", () => {
    const items = buildProjectMediaItems({
      title: "Lanterns",
      coverImage: "https://cdn.example/cover.jpg",
      gallery: [],
      video: "https://example.com/not-youtube",
    });

    expect(items).toEqual([
      { kind: "image", src: "https://cdn.example/cover.jpg", alt: "Lanterns cover" },
    ]);
  });
});
