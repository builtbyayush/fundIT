import type { MetadataRoute } from "next";

import { siteConfig } from "@/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/investor", "/api", "/payments/mock"],
    },
    sitemap: undefined,
    host: siteConfig.url,
  };
}
