import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface StepPanelProps {
  title: ReactNode;
  children: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

function StepPanel({ title, children, subtitle, actions, className }: StepPanelProps) {
  return (
    <section className={cn("mx-auto flex w-full max-w-3xl flex-col gap-4 text-center", className)}>
      <h2 className="text-base font-semibold">{title}</h2>
      {subtitle ? <p className="text-muted-foreground text-sm">{subtitle}</p> : null}
      <div className="flex flex-col gap-4">{children}</div>
      {actions}
    </section>
  );
}

export { StepPanel };
