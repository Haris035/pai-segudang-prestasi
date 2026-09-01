import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://prestasipai.my.id";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const achievements = await prisma.achievement.findMany({
        where: {
            status: "APPROVED",
        },
        select: {
            slug: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${SITE_URL}/prestasi`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/lapor-prestasi`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${SITE_URL}/saran`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    const achievementPages: MetadataRoute.Sitemap =
        achievements
            .filter((achievement) => Boolean(achievement.slug))
            .map((achievement) => ({
                url: `${SITE_URL}/prestasi/${achievement.slug}`,
                lastModified: achievement.createdAt,
                changeFrequency: "monthly" as const,
                priority: 0.8,
            }));

    return [...staticPages, ...achievementPages];
}