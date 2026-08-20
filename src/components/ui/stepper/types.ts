import type * as React from "react";

export type StepStatus = "completed" | "current" | "upcoming";

export interface StepItem {
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StepperLayoutProps {
  steps: StepItem[];
  currentStep: number;
  onStepChange?: (index: number) => void;
}

export function getStepStatus(index: number, currentStep: number): StepStatus {
  if (index < currentStep) return "completed";
  if (index === currentStep) return "current";
  return "upcoming";
}
