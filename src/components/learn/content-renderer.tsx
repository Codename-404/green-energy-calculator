"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle, Lightbulb, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import type {
  Article,
  AnyContentBlock,
  HeadingBlock,
  ParagraphBlock,
  ImageBlock,
  CalloutBlock,
  SpecTableBlock,
  ComparisonBlock,
  ListBlock,
  QuoteBlock,
} from "@/types/content";

/** Parse simple markdown-like text (bold, italic, links) to JSX */
function RichText({ text }: { text: string }) {
  // Process bold, italic, and links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Try to match link: [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    // Try to match bold: **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // Try to match italic: *text*
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

    // Find earliest match
    const matches = [
      linkMatch ? { type: "link" as const, match: linkMatch, index: linkMatch.index! } : null,
      boldMatch ? { type: "bold" as const, match: boldMatch, index: boldMatch.index! } : null,
      italicMatch ? { type: "italic" as const, match: italicMatch, index: italicMatch.index! } : null,
    ]
      .filter(Boolean)
      .sort((a, b) => a!.index - b!.index);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const earliest = matches[0]!;

    // Add text before the match
    if (earliest.index > 0) {
      parts.push(remaining.slice(0, earliest.index));
    }

    switch (earliest.type) {
      case "link":
        parts.push(
          <a
            key={key++}
            href={earliest.match[2]}
            className="text-primary underline underline-offset-4 hover:text-primary/80"
            target="_blank"
            rel="noopener noreferrer"
          >
            {earliest.match[1]}
          </a>
        );
        break;
      case "bold":
        parts.push(
          <strong key={key++} className="font-semibold">
            {earliest.match[1]}
          </strong>
        );
        break;
      case "italic":
        parts.push(
          <em key={key++}>{earliest.match[1]}</em>
        );
        break;
    }

    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }

  return <>{parts}</>;
}

/** Heading block renderer */
function HeadingRenderer({ block }: { block: HeadingBlock }) {
  const id = block.id ?? block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const Tag = `h${block.level}` as "h2" | "h3" | "h4";

  const sizeClasses = {
    2: "text-2xl font-bold tracking-tight mt-10 mb-4",
    3: "text-xl font-semibold tracking-tight mt-8 mb-3",
    4: "text-lg font-medium mt-6 mb-2",
  };

  return (
    <Tag id={id} className={sizeClasses[block.level]}>
      {block.text}
    </Tag>
  );
}

/** Paragraph block renderer */
function ParagraphRenderer({ block }: { block: ParagraphBlock }) {
  return (
    <p className="mb-4 leading-7 text-foreground/90">
      <RichText text={block.text} />
    </p>
  );
}

/** Image block renderer */
function ImageRenderer({ block }: { block: ImageBlock }) {
  return (
    <figure className="my-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <Image
          src={block.src}
          alt={block.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
        />
      </div>
      {(block.caption || block.credit) && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {block.caption && <span>{block.caption}</span>}
          {block.caption && block.credit && <span> -- </span>}
          {block.credit && block.creditUrl && (
            <a
              href={block.creditUrl}
              className="underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              Photo by {block.credit}
            </a>
          )}
          {block.credit && !block.creditUrl && (
            <span>Photo by {block.credit}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

/** Callout block renderer */
function CalloutRenderer({ block }: { block: CalloutBlock }) {
  const variantConfig = {
    info: {
      border: "border-l-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/50",
      icon: Info,
      iconColor: "text-blue-600",
      titleColor: "text-blue-800 dark:text-blue-300",
    },
    warning: {
      border: "border-l-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950/50",
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-800 dark:text-yellow-300",
    },
    tip: {
      border: "border-l-green-500",
      bg: "bg-green-50 dark:bg-green-950/50",
      icon: Lightbulb,
      iconColor: "text-green-600",
      titleColor: "text-green-800 dark:text-green-300",
    },
    important: {
      border: "border-l-red-500",
      bg: "bg-red-50 dark:bg-red-950/50",
      icon: AlertCircle,
      iconColor: "text-red-600",
      titleColor: "text-red-800 dark:text-red-300",
    },
  };

  const v = variantConfig[block.variant];
  const IconComponent = v.icon;

  return (
    <div
      className={`my-4 rounded-r-lg border-l-4 ${v.border} ${v.bg} p-4`}
      role="note"
      aria-label={block.title ?? `${block.variant} callout`}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={`mt-0.5 size-5 shrink-0 ${v.iconColor}`} />
        <div>
          {block.title && (
            <p className={`mb-1 font-semibold ${v.titleColor}`}>
              {block.title}
            </p>
          )}
          <p className="text-sm leading-relaxed">
            <RichText text={block.text} />
          </p>
        </div>
      </div>
    </div>
  );
}

/** Spec table block renderer */
function SpecTableRenderer({ block }: { block: SpecTableBlock }) {
  return (
    <div className="my-6 space-y-2">
      {block.title && (
        <h4 className="text-base font-semibold">{block.title}</h4>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {block.headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {block.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell
                  key={cellIndex}
                  className={cellIndex === 0 ? "font-medium" : ""}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Comparison block renderer */
function ComparisonRenderer({ block }: { block: ComparisonBlock }) {
  return (
    <div className="my-6 space-y-3">
      <h4 className="text-base font-semibold">{block.title}</h4>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {block.items.map((item) => (
          <Card key={item.name} size="sm">
            <CardHeader>
              <CardTitle className="text-base">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Pros */}
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                  <ThumbsUp className="size-3.5" />
                  Pros
                </p>
                <ul className="space-y-0.5">
                  {item.pros.map((pro) => (
                    <li
                      key={pro}
                      className="text-sm text-muted-foreground before:mr-1.5 before:content-['+'] before:font-bold before:text-green-600"
                    >
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400">
                  <ThumbsDown className="size-3.5" />
                  Cons
                </p>
                <ul className="space-y-0.5">
                  {item.cons.map((con) => (
                    <li
                      key={con}
                      className="text-sm text-muted-foreground before:mr-1.5 before:content-['-'] before:font-bold before:text-red-600"
                    >
                      {con}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best For */}
              <div className="rounded-md bg-muted/50 px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Best for:
                </p>
                <p className="text-sm font-medium">{item.bestFor}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** List block renderer */
function ListRenderer({ block }: { block: ListBlock }) {
  const Tag = block.ordered ? "ol" : "ul";
  return (
    <Tag
      className={`my-4 space-y-1 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}
    >
      {block.items.map((item, index) => (
        <li key={index} className="text-sm leading-relaxed text-foreground/90">
          <RichText text={item} />
        </li>
      ))}
    </Tag>
  );
}

/** Quote block renderer */
function QuoteRenderer({ block }: { block: QuoteBlock }) {
  return (
    <blockquote className="my-6 border-l-4 border-muted-foreground/30 pl-4">
      <p className="italic leading-relaxed text-foreground/80">
        &ldquo;
        <RichText text={block.text} />
        &rdquo;
      </p>
      {block.source && (
        <footer className="mt-1 text-sm text-muted-foreground">
          -- {block.source}
        </footer>
      )}
    </blockquote>
  );
}

/** Render a single content block based on its type */
function BlockRenderer({ block }: { block: AnyContentBlock }) {
  switch (block.type) {
    case "heading":
      return <HeadingRenderer block={block} />;
    case "paragraph":
      return <ParagraphRenderer block={block} />;
    case "image":
      return <ImageRenderer block={block} />;
    case "callout":
      return <CalloutRenderer block={block} />;
    case "spec-table":
      return <SpecTableRenderer block={block} />;
    case "comparison":
      return <ComparisonRenderer block={block} />;
    case "list":
      return <ListRenderer block={block} />;
    case "quote":
      return <QuoteRenderer block={block} />;
    default:
      return null;
  }
}

/** Main content renderer for an article */
export function ContentRenderer({ article }: { article: Article }) {
  return (
    <article className="prose-custom max-w-none" aria-label={article.title}>
      {/* Hero Image */}
      <figure className="mb-8">
        <div className="relative aspect-[2.4/1] w-full overflow-hidden rounded-xl">
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
          />
        </div>
        {article.heroImage.credit && (
          <figcaption className="mt-2 text-center text-xs text-muted-foreground">
            <a
              href={article.heroImage.creditUrl}
              className="underline underline-offset-2 hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              Photo by {article.heroImage.credit}
            </a>
          </figcaption>
        )}
      </figure>

      {/* Article header */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{article.category}</Badge>
          <span className="text-sm text-muted-foreground">
            {article.readingTime} min read
          </span>
          <span className="text-sm text-muted-foreground">
            By {article.author}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {article.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      {/* Article blocks */}
      <div>
        {article.blocks.map((block, index) => (
          <BlockRenderer key={index} block={block} />
        ))}
      </div>
    </article>
  );
}
