"use client";

import { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { StepperProvider } from "@/components/stepper-provider";
import { StepperView } from "@/components/stepper-view";
import type { StepItem } from "@/components/ui/stepper";
import { quoteDefaultValues, quoteSchema, stepFields } from "@/lib/quote-schema";
import type { QuoteFormValues } from "@/lib/quote-schema";

export interface QuoteFlowProps {
  steps: StepItem[];
  children: React.ReactNode;
}

function QuoteFlow({ steps, children }: QuoteFlowProps) {
  const form = useForm<QuoteFormValues>({
    resolver: standardSchemaResolver(quoteSchema),
    defaultValues: quoteDefaultValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const { trigger, setValue, getValues } = form;

  const beforeNext = useCallback(
    async (index: number) => {
      const fields = stepFields[index];
      if (!fields?.length) return true;

      const isValid = await trigger(fields, { shouldFocus: true });
      if (!isValid) {
        for (const field of fields) {
          setValue(field, getValues(field), { shouldTouch: true, shouldValidate: false });
        }
      }
      return isValid;
    },
    [trigger, setValue, getValues],
  );

  return (
    <FormProvider {...form}>
      <StepperProvider steps={steps} beforeNext={beforeNext}>
        <StepperView>{children}</StepperView>
      </StepperProvider>
    </FormProvider>
  );
}

export { QuoteFlow };
