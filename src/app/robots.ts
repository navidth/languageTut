import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/student/", "/teacher/", "/reset-password", "/ui-kit"] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
