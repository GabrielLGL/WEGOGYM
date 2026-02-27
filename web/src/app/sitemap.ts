import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://kore-app.com",
      lastModified: new Date("2026-02-27"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://kore-app.com/privacy",
      lastModified: new Date("2026-01-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
