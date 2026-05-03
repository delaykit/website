import type { MetadataRoute } from "next";
import { patterns } from "@/lib/patterns";

const BASE = "https://delaykit.dev";

// Next.js generates `/sitemap.xml` from this default export. Sourced
// directly from the patterns array so adding a new pattern to
// `lib/patterns.ts` automatically registers it for indexing.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: BASE,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/patterns`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...patterns.map((p) => ({
      url: `${BASE}/patterns/${p.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
