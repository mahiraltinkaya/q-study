import { memo, type ReactNode } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StepStatus } from "@/components/ui/stepper/types";

const indicatorStyles: Record<StepStatus, string> = {
  completed: "bg-brand text-white",
  current: "bg-brand text-white",
  upcoming: "bg-zinc-200/80 text-zinc-500",
};

export interface StepIndicatorProps {
  status: StepStatus;
  index: number;
  icon?: ReactNode;
}

const StepIndicator = memo(function StepIndicator({ status, index, icon }: StepIndicatorProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 md:size-9 md:text-[0.9375rem]",
        indicatorStyles[status],
      )}
    >
      {status === "completed" ? <Check className="size-4" strokeWidth={3} /> : (icon ?? index + 1)}
    </span>
  );
});

export { StepIndicator };
