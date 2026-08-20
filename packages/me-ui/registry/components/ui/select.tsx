"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { FieldHint, type FieldHintContent } from "@/components/ui/field-hint";

export interface SelectProps {
  options: readonly string[];
  value: string | null;
  onValueChange: (value: string) => void;
  onClose?: () => void;
  placeholder?: string;
  icon?: ReactNode;
  tooltip?: FieldHintContent;
  id?: string;
  name?: string;
  invalid?: boolean;
  disabled?: boolean;
  describedBy?: string;
}

function Select({
  options,
  value,
  onValueChange,
  onClose,
  placeholder,
  icon,
  tooltip,
  id,
  name,
  invalid,
  disabled,
  describedBy,
}: SelectProps) {
  const [focused, setFocused] = useState(false);
  const hintId = id ? `${id}-hint` : "field-hint";
  const hintOpen = Boolean(tooltip) && focused;
  const describedByAll =
    [describedBy, hintOpen ? hintId : undefined].filter(Boolean).join(" ") || undefined;

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  return (
    <SelectPrimitive.Root
      value={value}
      disabled={disabled}
      onValueChange={(next) => onValueChange(String(next ?? ""))}
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <div className="relative w-full">
        {icon ? (
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-1 -translate-y-1/2">
            {icon}
          </span>
        ) : null}
        <SelectPrimitive.Trigger
          id={id}
          name={name}
          data-slot="select-trigger"
          aria-invalid={invalid}
          aria-describedby={describedByAll}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "border-input focus-visible:border-brand focus-visible:ring-brand/20 aria-invalid:border-brand aria-invalid:ring-brand/20 h-11.25 w-full rounded-lg border bg-transparent px-4 text-left text-base transition-colors outline-none select-none focus-visible:border-2 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-2 aria-invalid:ring-3 md:text-sm",
            "flex items-center justify-between gap-2",
            icon && "pl-10",
            tooltip ? "pr-16" : "pr-10",
          )}
        >
          <SelectPrimitive.Value
            className="data-placeholder:text-muted-foreground truncate"
            placeholder={placeholder}
          />
          <SelectPrimitive.Icon
            className={cn(
              "text-muted-foreground absolute top-1/2 -translate-y-1/2 transition-transform duration-200 data-[popup-open]:rotate-180",
              tooltip ? "right-10" : "right-3",
            )}
          >
            <ChevronDown className="size-4" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        {tooltip ? (
          <FieldHint hint={tooltip} open={hintOpen} id={hintId} className="right-3" />
        ) : null}
      </div>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          className="z-50 outline-none select-none"
          sideOffset={6}
          alignItemWithTrigger={false}
        >
          <SelectPrimitive.Popup className="max-h-[min(20rem,var(--available-height))] w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg transition-[opacity,scale] duration-150 data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0">
            <SelectPrimitive.List className="max-h-[min(20rem,var(--available-height))] overflow-y-auto py-1.5">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option}
                  value={option}
                  className="data-highlighted:text-brand grid cursor-pointer grid-cols-[1rem_1fr] items-center gap-2 px-4 py-2.5 text-sm outline-none select-none data-highlighted:bg-zinc-50"
                >
                  <SelectPrimitive.ItemIndicator className="text-brand col-start-1">
                    <Check className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText className="col-start-2">
                    {option}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export { Select };
