"use client";

import { useCallback } from "react";
import { useFormContext } from "react-hook-form";

import { useStepper } from "@/components/stepper-provider";
import { StepPanel } from "@/components/steps/step-panel";
import { ConditionList } from "@/components/steps/condition-list";
import { Button } from "@/components/ui/button";
import { HEALTH_CONDITIONS } from "@/lib/health-conditions";
import type { QuoteFormValues } from "@/lib/quote-schema";

const ANSWER_CLASS = "text-xs font-semibold tracking-wide uppercase sm:w-[19rem] sm:text-sm";

function HealthInformation() {
  const { setValue } = useFormContext<QuoteFormValues>();
  const { goNext } = useStepper();

  const answer = useCallback(
    (value: QuoteFormValues["hasDiagnosis"]) => {
      setValue("hasDiagnosis", value, { shouldValidate: true, shouldTouch: true });
      void goNext();
    },
    [setValue, goNext],
  );

  const answerYes = useCallback(() => answer("yes"), [answer]);
  const answerNo = useCallback(() => answer("no"), [answer]);

  return (
    <StepPanel
      title="Teklif için son bir adım kaldı."
      subtitle="Aşağıdaki hastalıklardan biri veya birkaçı için teşhis veya tedavi aldınız mı?"
      actions={
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="secondary"
            size="xl"
            shape="pill"
            onClick={answerYes}
            className={ANSWER_CLASS}
          >
            Evet, Teşhis / Tedavi Aldım
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xl"
            shape="pill"
            onClick={answerNo}
            className={ANSWER_CLASS}
          >
            Hayır, Teşhis / Tedavi Almadım
          </Button>
        </div>
      }
    >
      <hr className="border-zinc-200" />
      <ConditionList conditions={HEALTH_CONDITIONS} />
    </StepPanel>
  );
}

export { HealthInformation };
