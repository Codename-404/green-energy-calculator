"use client";

import { useState, useCallback } from "react";
import { useAtomValue } from "jotai";
import { comparisonIdsAtom } from "@/store/atoms";
import { EquipmentFilters } from "@/components/equipment/equipment-filters";
import { EquipmentGrid } from "@/components/equipment/equipment-grid";
import { ComparisonTray } from "@/components/equipment/comparison-tray";
import { ComparisonTable } from "@/components/equipment/comparison-table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { SlidersHorizontal, BarChart3 } from "lucide-react";

export function EquipmentClient() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const comparisonIds = useAtomValue(comparisonIdsAtom);

  const handleCompareClick = useCallback(() => {
    setShowComparison(true);
    // Scroll to comparison section
    setTimeout(() => {
      const el = document.getElementById("comparison-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page header */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Equipment Database
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Browse, compare, and find the perfect equipment for your green
              energy system.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile filters toggle */}
      <div className="mb-4 lg:hidden">
        <Button
          variant="outline"
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </div>

      {/* Mobile filters sheet */}
      <Sheet
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
      >
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Narrow down your equipment search.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <EquipmentFilters compact />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: sidebar + grid layout */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]">
        {/* Desktop sidebar filters */}
        <aside className="hidden lg:block">
          <Card className="sticky top-24">
            <CardContent className="pt-4">
              <EquipmentFilters />
            </CardContent>
          </Card>
        </aside>

        {/* Equipment grid */}
        <main>
          <EquipmentGrid />
        </main>
      </div>

      {/* Comparison Section */}
      {showComparison && comparisonIds.length >= 2 && (
        <div id="comparison-section" className="mt-10 scroll-mt-8">
          <ComparisonTable />
        </div>
      )}

      {/* Comparison Tray (sticky bottom) */}
      <ComparisonTray onCompareClick={handleCompareClick} />

      {/* Bottom spacer when tray is visible */}
      {comparisonIds.length > 0 && <div className="h-16" aria-hidden />}
    </div>
  );
}
