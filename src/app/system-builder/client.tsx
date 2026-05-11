"use client";

import { useEffect } from "react";
import { initEquipmentData } from "@/store/derived";
import { useWizard } from "@/hooks/use-wizard";
import { WizardStepper } from "@/components/system-builder/wizard/wizard-stepper";
import { WizardNavigation } from "@/components/system-builder/wizard/wizard-navigation";
import { StepLocation } from "@/components/system-builder/wizard/step-location";
import { StepEquipment } from "@/components/system-builder/wizard/step-equipment";
import { StepFinancial } from "@/components/system-builder/wizard/step-financial";
import { StepResults } from "@/components/system-builder/wizard/step-results";

export function SystemBuilderClient() {
  useEffect(() => {
    initEquipmentData();
  }, []);

  const wizard = useWizard();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">System Builder</h1>
        <p className="mt-2 text-muted-foreground">
          Design your custom green energy system in {wizard.steps.length} simple steps.
        </p>
      </div>

      {/* Wizard stepper */}
      <WizardStepper
        steps={wizard.steps}
        currentStep={wizard.currentStep}
        visitedSteps={wizard.visitedSteps}
        onStepClick={wizard.goToStep}
        canNavigateTo={wizard.canNavigateTo}
      />

      {/* Step content */}
      <div className="mt-8">
        {wizard.currentStep === 0 && <StepLocation />}
        {wizard.currentStep === 1 && <StepEquipment />}
        {wizard.currentStep === 2 && <StepFinancial />}
        {wizard.currentStep === 3 && <StepResults onGoToStep={wizard.goToStep} />}
      </div>

      {/* Navigation buttons (hidden on results step) */}
      {!wizard.isResultsStep && (
        <WizardNavigation
          canGoBack={wizard.canGoBack}
          canGoNext={wizard.canGoNext}
          isNextResults={wizard.currentStep === 2}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
        />
      )}
    </div>
  );
}
