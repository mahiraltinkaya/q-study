"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";
import { FieldHint, type FieldHintContent } from "@/components/ui/field-hint";

export type InputTooltip = FieldHintContent;

export interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
  tooltip?: InputTooltip;
}

function Input({
  className,
  type,
  icon,
  tooltip,
  onFocus,
  onBlur,
  id,
  "aria-describedby": describedBy,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const hintId = id ? `${id}-hint` : undefined;
  const hintOpen = Boolean(tooltip) && focused;

  const describedByAll =
    [describedBy, hintOpen ? hintId : undefined].filter(Boolean).join(" ") || undefined;

  const handleFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const field = (
    <InputPrimitive
      type={type}
      id={id}
      data-slot="input"
      aria-describedby={describedByAll}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-brand/20 disabled:bg-input/50 aria-invalid:border-brand aria-invalid:ring-brand/20 h-11.25 w-full min-w-0 rounded-lg border bg-transparent px-4 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-2 focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-2 aria-invalid:ring-3 md:text-sm",
        icon && "pl-10",
        tooltip && "pr-10",
        className,
      )}
      {...props}
    />
  );

  if (!icon && !tooltip) return field;

  return (
    <div className="relative w-full">
      {icon ? (
        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
          {icon}
        </span>
      ) : null}
      {field}
      {tooltip ? (
        <FieldHint hint={tooltip} open={hintOpen} id={hintId ?? "field-hint"} className="right-3" />
      ) : null}
    </div>
  );
}

export { Input };
