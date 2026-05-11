import type { Article } from "@/types/content";
import { articles } from "@/data";

export { articles };

/** Look up an article by its slug */
export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/** Get articles filtered by category */
export function getArticlesByCategory(
  category: "guide" | "comparison" | "glossary" | "all"
): Article[] {
  if (category === "all") return articles;
  return articles.filter((a) => a.category === category);
}
