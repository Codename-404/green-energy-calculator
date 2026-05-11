// JSON-based content structure for educational guides/articles

export interface ContentBlock {
  type: "heading" | "paragraph" | "image" | "callout" | "spec-table" | "comparison" | "list" | "quote";
}

export interface HeadingBlock extends ContentBlock {
  type: "heading";
  level: 2 | 3 | 4;
  text: string;
  id?: string; // for anchor links
}

export interface ParagraphBlock extends ContentBlock {
  type: "paragraph";
  text: string; // supports basic markdown (bold, italic, links)
}

export interface ImageBlock extends ContentBlock {
  type: "image";
  src: string; // Unsplash URL
  alt: string;
  caption?: string;
  credit?: string; // Unsplash photographer name
  creditUrl?: string; // Unsplash photographer profile
  width?: number;
  height?: number;
}

export interface CalloutBlock extends ContentBlock {
  type: "callout";
  variant: "info" | "warning" | "tip" | "important";
  title?: string;
  text: string;
}

export interface SpecTableBlock extends ContentBlock {
  type: "spec-table";
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface ComparisonBlock extends ContentBlock {
  type: "comparison";
  title: string;
  items: {
    name: string;
    pros: string[];
    cons: string[];
    bestFor: string;
  }[];
}

export interface ListBlock extends ContentBlock {
  type: "list";
  ordered: boolean;
  items: string[];
}

export interface QuoteBlock extends ContentBlock {
  type: "quote";
  text: string;
  source?: string;
}

export type AnyContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | CalloutBlock
  | SpecTableBlock
  | ComparisonBlock
  | ListBlock
  | QuoteBlock;

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: "guide" | "comparison" | "glossary";
  heroImage: {
    src: string;
    alt: string;
    credit: string;
    creditUrl: string;
  };
  author: string;
  publishedAt: string; // ISO date
  updatedAt: string;
  readingTime: number; // minutes
  tags: string[];
  blocks: AnyContentBlock[];
}
