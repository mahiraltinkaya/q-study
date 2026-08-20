"use client";

import * as React from "react";
import type { ReactNode } from "react";

import { useStepper } from "@/components/stepper-provider";
import { StepActions } from "@/components/steps/step-actions";
import { cn } from "@/lib/utils";

export interface StepCardProps {
  title: ReactNode;
  children: ReactNode;
  subtitle?: ReactNode;
  nextLabel?: string;
  className?: string;
}

function StepCard({ title, children, subtitle, nextLabel, className }: StepCardProps) {
  const { goNext } = useStepper();

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void goNext();
    },
    [goNext],
  );

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={cn(
        "mx-auto flex w-full max-w-xl flex-col gap-6 rounded-2xl border bg-white p-8",
        className,
      )}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle ? <p className="text-muted-foreground text-sm">{subtitle}</p> : null}
      <div className="flex flex-col gap-6">{children}</div>
      <StepActions nextLabel={nextLabel} />
    </form>
  );
}

export { StepCard };
