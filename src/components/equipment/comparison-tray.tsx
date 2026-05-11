"use client";

import { useAtom, useAtomValue } from "jotai";
import { comparisonIdsAtom } from "@/store/atoms";
import { comparisonItemsAtom } from "@/store/derived";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, GitCompareArrows, Trash2 } from "lucide-react";
import type { AnyEquipment } from "@/types/equipment";

interface ComparisonTrayProps {
  onCompareClick: () => void;
}

export function ComparisonTray({ onCompareClick }: ComparisonTrayProps) {
  const [comparisonIds, setComparisonIds] = useAtom(comparisonIdsAtom);
  const items = useAtomValue(comparisonItemsAtom) as AnyEquipment[];

  if (items.length === 0) return null;

  const handleClear = () => {
    setComparisonIds([]);
  };

  const removeItem = (id: string) => {
    setComparisonIds((ids) => ids.filter((i) => i !== id));
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
      <div className="container mx-auto flex items-center gap-4 px-4 py-3">
        {/* Icon + count */}
        <div className="flex items-center gap-2">
          <GitCompareArrows className="size-5 text-primary" />
          <Badge variant="secondary">{items.length}/3</Badge>
        </div>

        {/* Selected items */}
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex shrink-0 items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1.5"
            >
              <span className="text-xs font-medium">
                {item.brand} {item.model}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Remove ${item.model} from comparison`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            aria-label="Clear all comparison items"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
          <Button
            size="sm"
            onClick={onCompareClick}
            disabled={items.length < 2}
            aria-label="Compare selected items"
          >
            <GitCompareArrows className="size-3.5" />
            Compare Now
          </Button>
        </div>
      </div>
    </div>
  );
}
