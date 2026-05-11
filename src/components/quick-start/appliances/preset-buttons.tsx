"use client";

import { useSetAtom } from "jotai";
import { useMemo } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { aggregateLoad } from "@/lib/appliance-load";
import { applianceSelectionsAtom } from "@/store/atoms";
import { appliancePresets as PRESETS, type AppliancePreset } from "@/data";

function resolveIcon(name: string): LucideIcon {
  const record = LucideIcons as unknown as Record<string, LucideIcon>;
  return record[name] ?? LucideIcons.Home;
}

export function PresetButtons() {
  const setSelections = useSetAtom(applianceSelectionsAtom);

  const presetsWithLoad = useMemo(
    () =>
      PRESETS.map((p) => ({
        ...p,
        dailyKwh: aggregateLoad(p.items, []).dailyKwh,
      })),
    [],
  );

  const apply = (preset: AppliancePreset) => {
    setSelections(preset.items.map((i) => ({ ...i })));
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {presetsWithLoad.map((p) => {
        const Icon = resolveIcon(p.icon);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => apply(p)}
            className="group text-left"
          >
            <Card
              size="sm"
              className="h-full transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
            >
              <CardContent className="flex h-full flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div>
                  <p className="text-base font-semibold">{p.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.description}
                  </p>
                </div>
                <p className="mt-auto text-xs font-semibold text-primary tabular-nums">
                  ~{p.dailyKwh.toFixed(1)} kWh/day
                </p>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
