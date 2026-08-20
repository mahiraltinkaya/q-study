"use client";

import * as React from "react";

import type { StepItem } from "@/components/ui/stepper";

export interface StepperContextValue {
  steps: StepItem[];
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goNext: () => Promise<boolean>;
  goBack: () => void;
  goToStep: (index: number) => void;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);

export function useStepper() {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a <StepperProvider>");
  }
  return context;
}

export interface StepperProviderProps {
  steps: StepItem[];
  initialStep?: number;
  onStepChange?: (index: number) => void;
  beforeNext?: (index: number) => boolean | Promise<boolean>;
  children: React.ReactNode;
}

function StepperProvider({
  steps,
  initialStep = 0,
  onStepChange,
  beforeNext,
  children,
}: StepperProviderProps) {
  const [currentStep, setCurrentStep] = React.useState(initialStep);
  const totalSteps = steps.length;

  const goToStep = React.useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), totalSteps - 1);
      setCurrentStep(clamped);
      onStepChange?.(clamped);
    },
    [totalSteps, onStepChange],
  );

  const goNext = React.useCallback(async () => {
    const allowed = (await beforeNext?.(currentStep)) ?? true;
    if (!allowed) return false;
    goToStep(currentStep + 1);
    return true;
  }, [beforeNext, currentStep, goToStep]);

  const goBack = React.useCallback(() => goToStep(currentStep - 1), [currentStep, goToStep]);

  const value = React.useMemo<StepperContextValue>(
    () => ({
      steps,
      currentStep,
      totalSteps,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === totalSteps - 1,
      goNext,
      goBack,
      goToStep,
    }),
    [steps, currentStep, totalSteps, goNext, goBack, goToStep],
  );

  return <StepperContext.Provider value={value}>{children}</StepperContext.Provider>;
}

export { StepperProvider };
