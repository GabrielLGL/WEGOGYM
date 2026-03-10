import type { MetadataRoute } from "next";

// v2
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kore-app.net";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date("2026-03-10"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date("2026-01-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date("2026-03-10"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/cgu`,
      lastModified: new Date("2026-03-09"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/mentions-legales`,
      lastModified: new Date("2026-02-27"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
