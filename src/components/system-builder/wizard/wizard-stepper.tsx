"use client";

import { MapPin, Wrench, DollarSign, BarChart3, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WizardStep } from "@/hooks/use-wizard";

const DEFAULT_STEP_ICONS: LucideIcon[] = [
  MapPin,
  Wrench,
  DollarSign,
  BarChart3,
];

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  visitedSteps: Set<number>;
  onStepClick: (step: number) => void;
  canNavigateTo: (step: number) => boolean;
  icons?: LucideIcon[];
  ariaLabel?: string;
}

export function WizardStepper({
  steps,
  currentStep,
  visitedSteps,
  onStepClick,
  canNavigateTo,
  icons = DEFAULT_STEP_ICONS,
  ariaLabel = "System builder steps",
}: WizardStepperProps) {
  return (
    <nav aria-label={ariaLabel} className="w-full">
      {/* Desktop stepper */}
      <ol className="hidden items-center md:flex" role="list">
        {steps.map((step, idx) => {
          const Icon = icons[idx] ?? DEFAULT_STEP_ICONS[idx % DEFAULT_STEP_ICONS.length];
          const isCompleted = visitedSteps.has(idx) && idx < currentStep;
          const isActive = idx === currentStep;
          const isClickable = canNavigateTo(idx);

          return (
            <li key={step.id} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(idx)}
                disabled={!isClickable}
                aria-current={isActive ? "step" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isClickable && !isActive
                    ? "cursor-pointer hover:bg-muted/50"
                    : isActive
                      ? "cursor-default"
                      : "cursor-not-allowed opacity-50"
                }`}
              >
                {/* Step circle */}
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isCompleted
                      ? "border-green-600 bg-green-600 text-white"
                      : isActive
                        ? "border-green-600 bg-green-50 text-green-600 ring-4 ring-green-600/10 dark:bg-green-950"
                        : "border-muted-foreground/30 text-muted-foreground/50"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </div>

                {/* Label */}
                <p
                  className={`text-sm font-semibold leading-tight ${
                    isActive
                      ? "text-green-700 dark:text-green-400"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                  }`}
                >
                  {step.label}
                </p>
              </button>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${
                    visitedSteps.has(idx + 1) || idx < currentStep
                      ? "bg-green-600"
                      : "bg-muted-foreground/20"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile stepper */}
      <div className="md:hidden">
        <ol className="flex items-center justify-center gap-2" role="list">
          {steps.map((step, idx) => {
            const isCompleted = visitedSteps.has(idx) && idx < currentStep;
            const isActive = idx === currentStep;
            const isClickable = canNavigateTo(idx);

            return (
              <li key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(idx)}
                  disabled={!isClickable}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${idx + 1}: ${step.label}`}
                  className={`flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                    isCompleted
                      ? "border-green-600 bg-green-600 text-white"
                      : isActive
                        ? "border-green-600 bg-green-50 text-green-600 ring-4 ring-green-600/10 dark:bg-green-950"
                        : isClickable
                          ? "border-muted-foreground/30 text-muted-foreground/50"
                          : "border-muted-foreground/20 text-muted-foreground/30"
                  }`}
                >
                  {isCompleted ? <Check className="size-4" /> : idx + 1}
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-6 rounded-full ${
                      visitedSteps.has(idx + 1) || idx < currentStep
                        ? "bg-green-600"
                        : "bg-muted-foreground/20"
                    }`}
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
        {/* Current step label */}
        <p className="mt-2 text-center text-sm font-medium text-green-700 dark:text-green-400">
          {steps[currentStep].label}
        </p>
      </div>
    </nav>
  );
}
