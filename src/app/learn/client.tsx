"use client";

import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GuideCard } from "@/components/learn/guide-card";
import type { Article } from "@/types/content";

interface LearnHubClientProps {
  articles: Article[];
}

function ArticleGrid({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No articles found in this category yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <GuideCard key={article.slug} article={article} />
      ))}
    </div>
  );
}

export function LearnHubClient({ articles }: LearnHubClientProps) {
  const guides = useMemo(
    () => articles.filter((a) => a.category === "guide"),
    [articles]
  );
  const comparisons = useMemo(
    () => articles.filter((a) => a.category === "comparison"),
    [articles]
  );

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="guide">Guides</TabsTrigger>
        <TabsTrigger value="comparison">Comparisons</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <ArticleGrid articles={articles} />
      </TabsContent>

      <TabsContent value="guide">
        <ArticleGrid articles={guides} />
      </TabsContent>

      <TabsContent value="comparison">
        <ArticleGrid articles={comparisons} />
      </TabsContent>
    </Tabs>
  );
}
