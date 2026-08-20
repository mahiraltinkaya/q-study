"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";
import { StepperRail } from "@/components/ui/stepper/stepper-rail";
import type { StepperLayoutProps } from "@/components/ui/stepper/types";

export type { StepItem, StepStatus } from "@/components/ui/stepper/types";

export interface StepperProps
  extends StepperLayoutProps, Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {}

function Stepper({ steps, currentStep, onStepChange, className, ...props }: StepperProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <StepperRail steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
    </div>
  );
}

export { Stepper };
