"use client";

import { useAtomValue } from "jotai";
import { activeEquipmentTabAtom } from "@/store/atoms";
import {
  filteredPanelsAtom,
  filteredBatteriesAtom,
  filteredTurbinesAtom,
  filteredInvertersAtom,
} from "@/store/derived";
import { EquipmentCard } from "./equipment-card";
import type { AnyEquipment } from "@/types/equipment";
import { PackageOpen } from "lucide-react";

export function EquipmentGrid() {
  const activeTab = useAtomValue(activeEquipmentTabAtom);
  const panels = useAtomValue(filteredPanelsAtom);
  const batteries = useAtomValue(filteredBatteriesAtom);
  const turbines = useAtomValue(filteredTurbinesAtom);
  const inverters = useAtomValue(filteredInvertersAtom);

  let items: AnyEquipment[] = [];
  switch (activeTab) {
    case "panels":
      items = panels;
      break;
    case "batteries":
      items = batteries;
      break;
    case "turbines":
      items = turbines;
      break;
    case "inverters":
      items = inverters;
      break;
  }

  const CATEGORY_LABELS: Record<string, string> = {
    panels: "solar panels",
    batteries: "batteries",
    turbines: "wind turbines",
    inverters: "inverters",
  };
  const categoryLabel = CATEGORY_LABELS[activeTab] ?? activeTab;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <PackageOpen className="mb-3 size-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">
          No {categoryLabel} match your filters.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{items.length}</span>{" "}
        {categoryLabel}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <EquipmentCard key={item.id} item={item} category={activeTab} />
        ))}
      </div>
    </div>
  );
}
