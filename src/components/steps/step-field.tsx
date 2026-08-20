"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";

export interface StepFieldProps {
  label: string;
  children: ReactNode;
  htmlFor?: string;
  error?: string;
}

export const errorIdFor = (name: string) => `${name}-error`;

function StepField({ label, children, htmlFor, error }: StepFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={htmlFor ? errorIdFor(htmlFor) : undefined}
          role="alert"
          className="text-brand flex items-center gap-1.5 text-xs font-medium"
        >
          <Info className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { StepField };
