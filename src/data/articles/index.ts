import type { Article } from "@/types/content";

import solarPanelTypes from "./solar-panel-types.json";
import batteryChemistryGuide from "./battery-chemistry-guide.json";
import howWeCalculate from "./how-we-calculate.json";

/** All available articles */
export const articles: Article[] = [
  howWeCalculate as unknown as Article,
  solarPanelTypes as unknown as Article,
  batteryChemistryGuide as unknown as Article,
];

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
