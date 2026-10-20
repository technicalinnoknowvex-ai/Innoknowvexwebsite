import type { MetadataRoute } from "next";
import { getPublicPrograms, getSiteUrl } from "../lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const publicPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/programs`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/careers`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/orvexa`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/Legal/PrivacyPolicy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/Legal/RefundPolicy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const programs = await getPublicPrograms();
    const programPages = programs
      .filter(
        (program): program is typeof program & { slug: string } =>
          typeof program.slug === "string" && program.slug.trim().length > 0,
      )
      .map((program) => ({
        url: `${siteUrl}/programs/${encodeURIComponent(program.slug)}`,
        ...(program.updatedAt && !Number.isNaN(Date.parse(program.updatedAt))
          ? { lastModified: new Date(program.updatedAt) }
          : {}),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));

    return [...publicPages, ...programPages];
  } catch (error) {
    console.error("Could not load program URLs for the sitemap:", error);
    return publicPages;
  }
}
