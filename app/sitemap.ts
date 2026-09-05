import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/products", priority: 0.9 },
    { path: "/about", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
    { path: "/track", priority: 0.5 },
    { path: "/replacement", priority: 0.5 },
    { path: "/policies/replacement", priority: 0.5 },
    { path: "/policies/shipping", priority: 0.4 },
    { path: "/policies/refund", priority: 0.4 },
    { path: "/policies/privacy", priority: 0.3 },
    { path: "/policies/terms", priority: 0.3 },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: r.priority,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    // Database unreachable — still return the static routes rather than a 500.
  }

  return [...staticRoutes, ...productRoutes];
}
