import type { MetadataRoute } from "next";

const BASE_URL = "https://theboyzstore.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/shop", "/about", "/delivery", "/contact", "/faq", "/blog", "/cart", "/checkout", "/policies"];
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" || route === "/shop" ? "daily" : "weekly",
    priority: route === "/" ? 1 : route === "/shop" ? 0.9 : 0.6,
  }));
}
