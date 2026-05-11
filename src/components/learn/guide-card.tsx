import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import type { Article } from "@/types/content";

interface GuideCardProps {
  article: Article;
}

export function GuideCard({ article }: GuideCardProps) {
  return (
    <Link
      href={`/learn/guides/${article.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      aria-label={`Read guide: ${article.title}`}
    >
      <Card className="h-full overflow-hidden transition-all duration-200 group-hover:ring-2 group-hover:ring-primary/20 group-hover:shadow-md">
        {/* Hero Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Category badge overlay */}
          <div className="absolute left-3 top-3">
            <Badge variant="default" className="capitalize">
              {article.category}
            </Badge>
          </div>
        </div>

        <CardContent className="space-y-3 pt-4">
          {/* Title */}
          <h3 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {/* Description */}
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {article.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              <span>{article.readingTime} min read</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Read more
              <ArrowRight className="size-3" />
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="outline" className="text-[10px]">
                +{article.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
