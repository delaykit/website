import type { MetadataRoute } from "next";

// Next.js generates `/robots.txt` from this default export. The sitemap
// URL is the same canonical host the sitemap itself uses.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://delaykit.dev/sitemap.xml",
    host: "https://delaykit.dev",
  };
}
