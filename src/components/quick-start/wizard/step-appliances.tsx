"use client";

import { useAtomValue } from "jotai";
import { Zap } from "lucide-react";
import { applianceSelectionsAtom, customAppliancesAtom } from "@/store/atoms";
import { LoadMeter } from "../appliances/load-meter";
import { ApplianceSearch } from "../appliances/appliance-search";
import { QuickAddChips } from "../appliances/quick-add-chips";
import { PresetButtons } from "../appliances/preset-buttons";
import { SelectedList } from "../appliances/selected-list";

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
      <span className="h-px flex-1 bg-border" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function StepAppliances() {
  const selections = useAtomValue(applianceSelectionsAtom);
  const customs = useAtomValue(customAppliancesAtom);

  const activeCount =
    selections.filter((s) => s.quantity > 0).length + customs.length;
  const hasItems = activeCount > 0;

  if (!hasItems) {
    return (
      <div className="space-y-8">
        <div className="space-y-3 text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Zap className="size-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            What will you power?
          </h2>
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            Type any appliance below, pick a common one, or start from a
            template.
          </p>
        </div>

        <ApplianceSearch variant="hero" />

        <div className="space-y-3">
          <SectionDivider label="or pick a common one" />
          <QuickAddChips variant="grid" />
        </div>

        <div className="space-y-3">
          <SectionDivider label="or start from a template" />
          <PresetButtons />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <LoadMeter />

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Selected ({activeCount})
        </p>
        <SelectedList />
      </div>

      <div className="space-y-3 pt-2">
        <ApplianceSearch variant="compact" />
        <QuickAddChips variant="inline" />
      </div>
    </div>
  );
}
