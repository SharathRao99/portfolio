import type { MetadataRoute } from "next";

const SITE_URL = "https://sharath-portfolio.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();
    return [
        { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
        { url: `${SITE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
        { url: `${SITE_URL}/projects`, lastModified, changeFrequency: "monthly", priority: 0.9 },
        { url: `${SITE_URL}/skills`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    ];
}
