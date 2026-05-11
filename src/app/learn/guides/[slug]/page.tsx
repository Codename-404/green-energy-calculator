import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug } from "@/data/articles";
import { ContentRenderer } from "@/components/learn/content-renderer";
import { TableOfContents } from "@/components/learn/table-of-contents";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

/** Generate static paths for all articles */
export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

/** Dynamic metadata based on article content */
export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      images: [
        {
          url: article.heroImage.src,
          alt: article.heroImage.alt,
        },
      ],
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/learn"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Learning Center
        </Link>
      </div>

      {/* Layout: content + sidebar TOC on desktop */}
      <div className="grid gap-8 lg:grid-cols-[1fr_250px]">
        {/* Main content */}
        <div className="min-w-0">
          <ContentRenderer article={article} />
        </div>

        {/* Sidebar Table of Contents (desktop only) */}
        <aside className="hidden lg:block" aria-label="Table of contents sidebar">
          <TableOfContents blocks={article.blocks} />
        </aside>
      </div>
    </div>
  );
}
