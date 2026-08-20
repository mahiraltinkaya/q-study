"use client";

import { useController, type FieldValues, type Path } from "react-hook-form";

import { Select, type SelectProps } from "@/components/ui/select";
import { StepField, errorIdFor } from "@/components/steps/step-field";

export interface FormSelectProps<T extends FieldValues> extends Omit<
  SelectProps,
  "value" | "onValueChange" | "onClose" | "id" | "name" | "invalid" | "describedBy"
> {
  name: Path<T>;
  label: string;
}

function FormSelect<T extends FieldValues>({ name, label, ...props }: FormSelectProps<T>) {
  const { field, fieldState } = useController<T>({ name });
  const error = fieldState.error?.message;

  return (
    <StepField label={label} htmlFor={name} error={error}>
      <Select
        {...props}
        id={name}
        name={field.name}
        value={field.value ?? null}
        invalid={Boolean(error)}
        describedBy={error ? errorIdFor(name) : undefined}
        onValueChange={field.onChange}
        onClose={field.onBlur}
      />
    </StepField>
  );
}

export { FormSelect };
