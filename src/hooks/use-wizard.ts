"use client";

import { useState, useCallback } from "react";

export interface WizardStep {
  id: number;
  label: string;
  description: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 0, label: "Location", description: "Set your location & region" },
  { id: 1, label: "Equipment", description: "Select your equipment" },
  { id: 2, label: "Financial", description: "Enter financial details" },
  { id: 3, label: "Results", description: "View your analysis" },
];

export function useWizard(
  initialStep = 0,
  steps: WizardStep[] = WIZARD_STEPS,
) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(
    () => new Set([initialStep]),
  );

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
        setVisitedSteps((prev) => new Set([...prev, step]));
      }
    },
    [steps.length],
  );

  const goNext = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      if (next < steps.length) {
        setVisitedSteps((vs) => new Set([...vs, next]));
        return next;
      }
      return prev;
    });
  }, [steps.length]);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const canNavigateTo = useCallback(
    (step: number) => visitedSteps.has(step) || step <= currentStep,
    [visitedSteps, currentStep],
  );

  return {
    currentStep,
    visitedSteps,
    goToStep,
    goNext,
    goBack,
    canGoNext: currentStep < steps.length - 1,
    canGoBack: currentStep > 0,
    isResultsStep: currentStep === steps.length - 1,
    canNavigateTo,
    steps,
  };
}
