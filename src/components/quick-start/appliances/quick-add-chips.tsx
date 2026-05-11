"use client";

import { useAtom } from "jotai";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLIANCE_BY_ID } from "@/lib/appliance-load";
import { applianceSelectionsAtom } from "@/store/atoms";

const QUICK_IDS = [
  "ac-1.5-ton",
  "fridge",
  "led-bulb",
  "tv-led",
  "laptop",
  "router",
];

const DISPLAY_LABEL: Record<string, string> = {
  "ac-1.5-ton": "AC 1.5T",
  fridge: "Fridge",
  "led-bulb": "Lights",
  "tv-led": "LED TV",
  laptop: "Laptop",
  router: "Wi-Fi",
};

function resolveIcon(name: string): LucideIcon {
  const record = LucideIcons as unknown as Record<string, LucideIcon>;
  return record[name] ?? LucideIcons.Zap;
}

interface Props {
  variant?: "grid" | "inline";
}

export function QuickAddChips({ variant = "inline" }: Props) {
  const [selections, setSelections] = useAtom(applianceSelectionsAtom);

  const add = (id: string) => {
    setSelections((prev) => {
      const idx = prev.findIndex((s) => s.applianceId === id);
      if (idx === -1) return [...prev, { applianceId: id, quantity: 1 }];
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
      return next;
    });
  };

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {QUICK_IDS.map((id) => {
          const a = APPLIANCE_BY_ID[id];
          if (!a) return null;
          const Icon = resolveIcon(a.icon);
          const sel = selections.find((s) => s.applianceId === id);
          const count = sel?.quantity ?? 0;
          const isAdded = count > 0;
          return (
            <button
              key={id}
              type="button"
              onClick={() => add(id)}
              aria-label={`Add ${a.name}`}
              className={cn(
                "group flex h-12 items-center gap-2.5 rounded-xl border px-3 text-sm font-medium transition-all",
                isAdded
                  ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                  : "border-border bg-background hover:border-primary/30 hover:bg-primary/5",
              )}
            >
              <Icon className={cn("size-5 shrink-0", isAdded && "text-primary")} />
              <span className="flex-1 text-left">
                {DISPLAY_LABEL[id] ?? a.name}
              </span>
              {isAdded ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] tabular-nums">
                  <Check className="size-2.5" />
                  {count}
                </span>
              ) : (
                <Plus className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {QUICK_IDS.map((id) => {
        const a = APPLIANCE_BY_ID[id];
        if (!a) return null;
        const Icon = resolveIcon(a.icon);
        const sel = selections.find((s) => s.applianceId === id);
        const count = sel?.quantity ?? 0;
        const isAdded = count > 0;
        return (
          <button
            key={id}
            type="button"
            onClick={() => add(id)}
            aria-label={`Add ${a.name}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isAdded
                ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                : "border-input bg-background hover:bg-muted",
            )}
          >
            <Icon className="size-3.5" />
            <span>{DISPLAY_LABEL[id] ?? a.name}</span>
            {isAdded ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/20 px-1.5 text-[10px] tabular-nums">
                <Check className="size-2.5" />
                {count}
              </span>
            ) : (
              <Plus className="size-3" />
            )}
          </button>
        );
      })}
    </div>
  );
}
