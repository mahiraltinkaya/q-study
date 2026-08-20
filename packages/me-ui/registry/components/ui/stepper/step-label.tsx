import { memo } from "react";

import { cn } from "@/lib/utils";
import type { StepStatus } from "@/components/ui/stepper/types";

const labelStyles: Record<StepStatus, string> = {
  completed: "text-zinc-900 font-semibold",
  current: "text-brand md:text-zinc-900 font-semibold",
  upcoming: "text-zinc-400 font-medium",
};

export interface StepLabelProps {
  label: string;
  description?: string;
  status: StepStatus;
  className?: string;
}

const StepLabel = memo(function StepLabel({
  label,
  description,
  status,
  className,
}: StepLabelProps) {
  return (
    <span
      className={cn(
        "flex min-w-0 flex-col text-left transition-colors",
        labelStyles[status],
        className,
      )}
    >
      <span className="truncate text-sm whitespace-nowrap md:text-[0.9375rem]">{label}</span>
      {description ? (
        <span className="truncate text-xs whitespace-nowrap opacity-70">{description}</span>
      ) : null}
    </span>
  );
});

export { StepLabel };
