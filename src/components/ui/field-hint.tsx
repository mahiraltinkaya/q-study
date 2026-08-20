"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

const ARROW_CLASS =
  "relative block h-1.5 w-3 overflow-clip data-[side=bottom]:top-[-6px] data-[side=left]:right-[-9px] data-[side=left]:rotate-90 data-[side=right]:left-[-9px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-6px] data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:bg-ink before:content-[''] before:[transform:translate(-50%,50%)_rotate(45deg)]";

export interface FieldHintContent {
  title: string;
  description: string;
}

export interface FieldHintProps {
  hint: FieldHintContent;
  open: boolean;
  id: string;
  className?: string;
}

function FieldHint({ hint, open, id, className }: FieldHintProps) {
  return (
    <Tooltip.Root open={open}>
      <Tooltip.Trigger
        render={<span aria-hidden />}
        className={cn(
          "group text-muted-foreground pointer-events-none absolute top-1/2 -translate-y-1/2",
          className,
        )}
      >
        <Info className="group-data-[popup-open]:fill-brand size-4 transition-colors group-data-[popup-open]:text-white" />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="right" sideOffset={28} collisionPadding={16} className="z-50">
          <Tooltip.Popup
            id={id}
            className="bg-ink w-72 max-w-[calc(100vw-2rem)] origin-[var(--transform-origin)] rounded-xl px-5 py-4 text-left shadow-xl transition-[opacity,scale] duration-150 data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0"
          >
            <Tooltip.Arrow className={ARROW_CLASS} />
            <p className="text-sm font-semibold text-white">{hint.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/70">{hint.description}</p>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export { FieldHint };
