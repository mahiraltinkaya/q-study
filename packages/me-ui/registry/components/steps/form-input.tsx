"use client";

import { useCallback, type ChangeEvent } from "react";
import { useController, type FieldValues, type Path } from "react-hook-form";

import { Input, type InputProps } from "@/components/ui/input";
import { StepField, errorIdFor } from "@/components/steps/step-field";

export interface FormInputProps<T extends FieldValues> extends Omit<
  InputProps,
  "name" | "defaultValue" | "value" | "onChange" | "onBlur"
> {
  name: Path<T>;
  label: string;
  normalize?: (value: string) => string;
}

function FormInput<T extends FieldValues>({
  name,
  label,
  normalize,
  maxLength,
  ...props
}: FormInputProps<T>) {
  const { field, fieldState } = useController<T>({ name });
  const error = fieldState.error?.message;
  const { onChange } = field;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!normalize) return onChange(event);
      const next = normalize(event.target.value);
      onChange(maxLength === undefined ? next : next.slice(0, maxLength));
    },
    [normalize, maxLength, onChange],
  );

  return (
    <StepField label={label} htmlFor={name} error={error}>
      <Input
        id={name}
        {...props}
        {...field}
        value={field.value ?? ""}
        onChange={handleChange}
        maxLength={normalize ? undefined : maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorIdFor(name) : undefined}
      />
    </StepField>
  );
}

export { FormInput };
