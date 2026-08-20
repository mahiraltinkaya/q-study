import { Button } from "@/components/ui/button";
import { discountLabel, formatPrice, type Plan } from "@/lib/plans";

export interface PlanCardProps {
  plan: Plan;
  onBuy?: () => void;
  onSendQuote?: () => void;
}

const CTA_CLASS = "w-full text-xs font-semibold tracking-wide uppercase";

function PlanCard({ plan, onBuy, onSendQuote }: PlanCardProps) {
  return (
    <article className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 text-center">
      <h3 className="text-base font-semibold text-zinc-900">{plan.name}</h3>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {plan.discounts.map((discount, index) => (
          <span key={discount.name} className="flex items-center gap-1.5">
            {index > 0 ? <span className="text-xs text-zinc-400">+</span> : null}
            <span className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
              {discountLabel(discount)}
            </span>
          </span>
        ))}
      </div>

      <p className="flex flex-col items-center gap-1">
        <span className="text-sm text-zinc-400 line-through">{formatPrice(plan.listPrice)}</span>
        <span className="text-brand text-3xl font-bold tracking-tight">
          {formatPrice(plan.price)}
        </span>
        <span className="text-xs text-zinc-400">/{plan.period}</span>
      </p>

      <div className="mt-2 flex w-full flex-col gap-2.5">
        <Button
          type="button"
          variant="ink"
          size="xl"
          shape="pill"
          onClick={onBuy}
          className={CTA_CLASS}
        >
          Satın Al
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xl"
          shape="pill"
          onClick={onSendQuote}
          className={CTA_CLASS}
        >
          Teklif Gönder
        </Button>
      </div>
    </article>
  );
}

export { PlanCard };
