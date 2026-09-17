import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SHOP } from "@/lib/shop";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { available: true },
    select: { slug: true, updatedAt: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SHOP.siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SHOP.siteUrl}/catalogue`, changeFrequency: "daily", priority: 0.9 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SHOP.siteUrl}/produit/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
