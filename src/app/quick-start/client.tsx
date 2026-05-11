"use client";

import { Plug, MapPin, Sliders, BarChart3 } from "lucide-react";
import { useAtomValue } from "jotai";
import { applianceSelectionsAtom, customAppliancesAtom } from "@/store/atoms";
import { useWizard, type WizardStep } from "@/hooks/use-wizard";
import { WizardStepper } from "@/components/system-builder/wizard/wizard-stepper";
import { WizardNavigation } from "@/components/system-builder/wizard/wizard-navigation";
import { StepAppliances } from "@/components/quick-start/wizard/step-appliances";
import { StepLocation } from "@/components/quick-start/wizard/step-location";
import { StepPreferences } from "@/components/quick-start/wizard/step-preferences";
import { StepRecommendations } from "@/components/quick-start/wizard/step-recommendations";
import { SummarySidebar } from "@/components/quick-start/wizard/summary-sidebar";
import { cn } from "@/lib/utils";

const QUICK_START_STEPS: WizardStep[] = [
  { id: 0, label: "Appliances", description: "What you want to power" },
  { id: 1, label: "Location", description: "Where it will go" },
  { id: 2, label: "Preferences", description: "Budget & grid mode" },
  { id: 3, label: "Results", description: "Your bundles" },
];

const STEP_ICONS = [Plug, MapPin, Sliders, BarChart3];

interface QuickStartClientProps {
  marketing?: React.ReactNode;
}

export function QuickStartClient({ marketing }: QuickStartClientProps = {}) {
  const wizard = useWizard(0, QUICK_START_STEPS);
  const selections = useAtomValue(applianceSelectionsAtom);
  const customAppliances = useAtomValue(customAppliancesAtom);

  const isStep0 = wizard.currentStep === 0;
  const activeCount =
    selections.filter((s) => s.quantity > 0).length + customAppliances.length;
  const showMarketing = Boolean(marketing) && isStep0 && activeCount === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {!isStep0 && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Quick Start</h1>
          <p className="mt-2 text-muted-foreground">
            Tell us what you want to power — we&apos;ll size the solar system
            for you.
          </p>
        </div>
      )}

      <div className={cn(isStep0 && "mx-auto max-w-2xl")}>
        <WizardStepper
          steps={wizard.steps}
          currentStep={wizard.currentStep}
          visitedSteps={wizard.visitedSteps}
          onStepClick={wizard.goToStep}
          canNavigateTo={wizard.canNavigateTo}
          icons={STEP_ICONS}
          ariaLabel="Quick start steps"
        />
      </div>

      <div
        className={cn(
          "mt-8 grid gap-6",
          isStep0 ? "mx-auto max-w-2xl" : "lg:grid-cols-[1fr_280px]",
        )}
      >
        <div>
          {wizard.currentStep === 0 && <StepAppliances />}
          {wizard.currentStep === 1 && <StepLocation />}
          {wizard.currentStep === 2 && <StepPreferences />}
          {wizard.currentStep === 3 && <StepRecommendations />}

          <WizardNavigation
            canGoBack={wizard.canGoBack}
            canGoNext={wizard.canGoNext}
            isNextResults={wizard.currentStep === QUICK_START_STEPS.length - 2}
            onBack={wizard.goBack}
            onNext={wizard.goNext}
          />
        </div>

        {!isStep0 && (
          <aside className="hidden lg:block">
            <SummarySidebar />
          </aside>
        )}
      </div>

      {showMarketing && (
        <div className="mt-16 border-t pt-12">{marketing}</div>
      )}
    </div>
  );
}
