"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardNavigationProps {
  canGoBack: boolean;
  canGoNext: boolean;
  /** True when the next step is the results step */
  isNextResults: boolean;
  onBack: () => void;
  onNext: () => void;
  /** Render Next with extra visual weight — bigger size + shadow + wider hit area. */
  prominent?: boolean;
  /** Disable Next without hiding it (communicates "do something first"). */
  nextDisabled?: boolean;
}

export function WizardNavigation({
  canGoBack,
  canGoNext,
  isNextResults,
  onBack,
  onNext,
  prominent = false,
  nextDisabled = false,
}: WizardNavigationProps) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      {canGoBack ? (
        <Button
          variant="outline"
          onClick={onBack}
          size={prominent ? "lg" : "default"}
          className="gap-2"
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>
      ) : (
        <div />
      )}

      {canGoNext && (
        <Button
          onClick={onNext}
          size={prominent ? "lg" : "default"}
          disabled={nextDisabled}
          className={cn(
            "gap-2 transition-all",
            prominent && "shadow-md hover:shadow-lg",
            prominent && !canGoBack && "w-full sm:w-auto sm:min-w-55",
            prominent && canGoBack && "min-w-40",
          )}
        >
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
