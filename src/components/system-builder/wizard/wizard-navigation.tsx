"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

interface WizardNavigationProps {
  canGoBack: boolean;
  canGoNext: boolean;
  /** True when the next step is the results step */
  isNextResults: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function WizardNavigation({
  canGoBack,
  canGoNext,
  isNextResults,
  onBack,
  onNext,
}: WizardNavigationProps) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      {canGoBack ? (
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="size-4" />
          Back
        </Button>
      ) : (
        <div />
      )}

      {canGoNext && (
        <Button onClick={onNext} className="gap-2">
          {isNextResults ? (
            <>
              View Results
              <BarChart3 className="size-4" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="size-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
