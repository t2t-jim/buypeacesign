import type { Metadata } from "next";
import Link from "next/link";
import { listBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from BuyPeaceSign — outdoor peace-sign lights, early access, and product updates.",
  alternates: { canonical: "https://buypeacesign.com/blog" },
};

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  return (
    <div className="stack" style={{ gap: "1.25rem" }}>
      <h1 className="page-title">Blog</h1>
      <p className="page-body">
        Product notes and early-access updates. More posts coming.
      </p>
      <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>
              <strong>{post.title}</strong>
            </Link>
            {post.date ? (
              <div className="page-body" style={{ fontSize: "0.85rem" }}>
                {post.date}
              </div>
            ) : null}
            {post.description ? (
              <p className="page-body" style={{ marginTop: "0.25rem" }}>
                {post.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {posts.length === 0 ? (
        <p className="page-body">No posts yet.</p>
      ) : null}
    </div>
  );
}
