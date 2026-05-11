"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import type { AnyContentBlock, HeadingBlock } from "@/types/content";

interface TableOfContentsProps {
  blocks: AnyContentBlock[];
}

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ blocks }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  /** Extract heading entries from the article blocks */
  const headings = useMemo<TocEntry[]>(() => {
    return blocks
      .filter((block): block is HeadingBlock => block.type === "heading")
      .map((block) => ({
        id:
          block.id ??
          block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        text: block.text,
        level: block.level,
      }));
  }, [blocks]);

  /** Observe heading elements and track which is currently in view */
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const aRect = a.boundingClientRect;
            const bRect = b.boundingClientRect;
            return aRect.top - bRect.top;
          });

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  /** Smooth scroll to heading */
  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav
      className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto"
      aria-label="Table of contents"
    >
      <h4 className="mb-3 text-sm font-semibold text-foreground">
        On This Page
      </h4>
      <ul className="space-y-1 border-l border-border">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const indentClass =
            heading.level === 3
              ? "pl-6"
              : heading.level === 4
                ? "pl-9"
                : "pl-3";

          return (
            <li key={heading.id}>
              <button
                type="button"
                onClick={() => scrollToHeading(heading.id)}
                className={`block w-full text-left text-sm leading-relaxed transition-colors ${indentClass} ${
                  isActive
                    ? "-ml-px border-l-2 border-primary font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={isActive ? "location" : undefined}
              >
                {heading.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
