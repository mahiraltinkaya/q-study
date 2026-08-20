"use client";

import * as React from "react";

import { useStepper } from "@/components/stepper-provider";
import { Stepper } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

export interface StepperViewProps {
  className?: string;
  children: React.ReactNode;
}

function StepperView({ className, children }: StepperViewProps) {
  const { steps, currentStep, totalSteps, goToStep } = useStepper();

  const stepChildren = React.useMemo(() => React.Children.toArray(children), [children]);

  return (
    <div className={cn("flex w-full flex-col gap-10", className)}>
      <Stepper steps={steps} currentStep={currentStep} onStepChange={goToStep} />
      <p aria-live="polite" className="sr-only">
        {`Adım ${currentStep + 1} / ${totalSteps}: ${steps[currentStep]?.label ?? ""}`}
      </p>
      {stepChildren[currentStep]}
    </div>
  );
}

export { StepperView };
