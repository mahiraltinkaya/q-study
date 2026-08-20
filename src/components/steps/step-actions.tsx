"use client";

import { useStepper } from "@/components/stepper-provider";
import { Button } from "@/components/ui/button";

export interface StepActionsProps {
  nextLabel?: string;
}

const ACTION_CLASS = "flex-1 text-sm font-semibold tracking-wide uppercase";

function StepActions({ nextLabel = "Devam Et" }: StepActionsProps) {
  const { goBack, isFirstStep, isLastStep } = useStepper();

  return (
    <div className="mt-2 flex gap-3">
      {!isFirstStep && (
        <Button type="button" variant="outline" size="xl" onClick={goBack} className={ACTION_CLASS}>
          Geri
        </Button>
      )}
      <Button type="submit" variant="brand" size="xl" className={ACTION_CLASS}>
        {isLastStep ? "Tamamla" : nextLabel}
      </Button>
    </div>
  );
}

export { StepActions };
