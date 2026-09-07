import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, listBlogPosts } from "@/lib/blog";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return listBlogPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return { title: "Post" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://buypeacesign.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://buypeacesign.com/blog/${post.slug}`,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <article className="stack" style={{ gap: "1rem" }}>
      <Link href="/blog" className="secondary-link">
        ← Blog
      </Link>
      <h1 className="page-title">{post.title}</h1>
      {post.date ? (
        <p className="page-body" style={{ fontSize: "0.85rem" }}>
          {post.date}
        </p>
      ) : null}
      <div className="page-body" style={{ whiteSpace: "pre-wrap" }}>
        {post.body}
      </div>
    </article>
  );
}
