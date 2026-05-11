"use client";

import { useState } from "react";
import { CostBreakdown } from "@/components/system-builder/cost-breakdown";
import { ROICalculator } from "@/components/system-builder/roi-calculator";
import { EnvironmentalImpact } from "@/components/system-builder/environmental-impact";
import { SystemSummary } from "@/components/system-builder/system-summary";
import { CompactConfigSidebar } from "./compact-config-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Settings2 } from "lucide-react";

interface StepResultsProps {
  onGoToStep: (step: number) => void;
}

export function StepResults({ onGoToStep }: StepResultsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleReconfigure = () => {
    setSheetOpen(false);
    onGoToStep(0);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Results */}
      <div className="space-y-6 min-w-0">
        <CostBreakdown />
        <ROICalculator />
        <EnvironmentalImpact />
        <SystemSummary />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border bg-card p-4">
          <CompactConfigSidebar onReconfigure={handleReconfigure} />
        </div>
      </aside>

      {/* Mobile floating button + Sheet */}
      <div className="lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="fixed bottom-6 right-6 z-40 gap-2 shadow-lg"
              />
            }
          >
            <Settings2 className="size-4" />
            Edit Config
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto p-4">
            <SheetHeader>
              <SheetTitle>System Configuration</SheetTitle>
              <SheetDescription>
                Adjust your system settings and see results update in real-time.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <CompactConfigSidebar onReconfigure={handleReconfigure} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
