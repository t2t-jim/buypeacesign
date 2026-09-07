import type { MetadataRoute } from "next";
import { listBlogPosts } from "@/lib/blog";

const siteUrl = "https://buypeacesign.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/configure",
    "/configure/review",
    "/preorder",
    "/install",
    "/blog",
  ].map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/blog" ? 0.8 : 0.6,
  }));

  let posts: MetadataRoute.Sitemap = [];
  try {
    posts = listBlogPosts().map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    posts = [];
  }

  return [...staticRoutes, ...posts];
}
