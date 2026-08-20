"use client";

import { StepPanel } from "@/components/steps/step-panel";
import { PlanCard } from "@/components/steps/plan-card";
import { PLANS, PREPAY_DISCOUNT, WELCOME_DISCOUNT, discountLabel, formatRate } from "@/lib/plans";

function SummaryDetail() {
  return (
    <StepPanel
      title="Size özel ihtiyaçlarınıza en uygun plan önerilerimizi hazırladık."
      subtitle={
        <>
          <span className="font-medium text-emerald-600">
            {discountLabel(WELCOME_DISCOUNT)} indiriminden
          </span>{" "}
          yararlanmak için hemen satın alın. Üstelik peşin ödemelerde{" "}
          <span className="font-medium text-emerald-600">
            ek {formatRate(PREPAY_DISCOUNT.rate)} indirim
          </span>
          .
        </>
      }
    >
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </StepPanel>
  );
}

export { SummaryDetail };
