"use client";

import { Fragment, memo, useCallback } from "react";

import { cn } from "@/lib/utils";
import { StepDivider } from "@/components/ui/stepper/step-divider";
import { StepIndicator } from "@/components/ui/stepper/step-indicator";
import { StepLabel } from "@/components/ui/stepper/step-label";
import {
  getStepStatus,
  type StepItem,
  type StepperLayoutProps,
} from "@/components/ui/stepper/types";

interface StepperRailItemProps {
  step: StepItem;
  index: number;
  currentStep: number;
  onStepChange?: (index: number) => void;
}

function StepperRailItem({ step, index, currentStep, onStepChange }: StepperRailItemProps) {
  const status = getStepStatus(index, currentStep);
  const isCurrent = status === "current";
  const clickable = Boolean(onStepChange) && status === "completed";
  const title = step.description ? `${step.label} — ${step.description}` : step.label;

  const handleClick = useCallback(() => onStepChange?.(index), [onStepChange, index]);

  const className = cn(
    "flex w-full items-center gap-2 rounded-full px-2 py-2.5 transition-colors duration-200 md:gap-4 md:px-2.5",
    isCurrent && "bg-white",
    clickable &&
      "cursor-pointer hover:bg-white/60 focus-visible:outline-brand focus-visible:outline-2 focus-visible:outline-offset-2",
  );

  const content = (
    <>
      <StepIndicator status={status} index={index} icon={step.icon} />
      <StepLabel
        label={step.label}
        description={step.description}
        status={status}
        className={cn(!isCurrent && "sr-only md:not-sr-only md:flex")}
      />
    </>
  );

  if (clickable) {
    return (
      <button
        type="button"
        onClick={handleClick}
        data-slot="stepper-item"
        data-status={status}
        className={className}
        title={title}
      >
        {content}
        <span className="sr-only">adımına dön</span>
      </button>
    );
  }

  return (
    <div
      aria-current={isCurrent ? "step" : undefined}
      data-slot="stepper-item"
      data-status={status}
      className={className}
      title={title}
    >
      {content}
    </div>
  );
}

const StepperRail = memo(function StepperRail({
  steps,
  currentStep,
  onStepChange,
}: StepperLayoutProps) {
  return (
    <nav aria-label="İlerleme" data-slot="stepper" className="relative block">
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-px w-screen -translate-x-1/2 -translate-y-1/2 bg-zinc-200/80"
      />
      <ol className="relative flex h-17 w-full items-stretch rounded-full border border-zinc-200/90 bg-white px-0.75">
        {steps.map((step, index) => (
          <Fragment key={step.label}>
            <li
              className={cn(
                "flex min-w-0 md:flex-1",
                index === currentStep ? "flex-1" : "flex-none",
              )}
            >
              <StepperRailItem
                step={step}
                index={index}
                currentStep={currentStep}
                onStepChange={onStepChange}
              />
            </li>
            {index < steps.length - 1 ? (
              <li aria-hidden className="mr-1.5 ml-0.5 flex shrink-0 items-stretch md:mr-6 md:ml-1">
                <StepDivider />
              </li>
            ) : null}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
});

export { StepperRail };
