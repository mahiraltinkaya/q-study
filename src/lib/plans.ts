export interface PlanDiscount {
  /** Fractional rate — `0.1` renders as `%10`. */
  rate: number;
  name: string;
}

export interface Plan {
  id: string;
  name: string;
  discounts: PlanDiscount[];
  /** Undiscounted premium, in TRY. */
  listPrice: number;
  /** What the applicant actually pays, in TRY. */
  price: number;
  period: string;
}

/**
 * Named so the marketing copy on the summary step can reference the same rate
 * the plan card prints — the two used to drift as separate hardcoded strings.
 */
export const WELCOME_DISCOUNT: PlanDiscount = { rate: 0.1, name: "Hoş geldin" };
export const PREPAY_DISCOUNT: PlanDiscount = { rate: 0.1, name: "Peşin" };

export const PLANS: Plan[] = [
  {
    id: "net-tss",
    name: "Net Tamamlayıcı Sağlık Sigortası",
    discounts: [WELCOME_DISCOUNT, PREPAY_DISCOUNT],
    listPrice: 8641.98,
    price: 7000,
    period: "yıllık",
  },
];

// Built once at module scope: constructing an Intl formatter is the expensive
// part, formatting with it is not.
const priceFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const rateFormatter = new Intl.NumberFormat("tr-TR", { style: "percent" });

export const formatPrice = (value: number) => `${priceFormatter.format(value)} TL`;
export const formatRate = (rate: number) => rateFormatter.format(rate);
export const discountLabel = (discount: PlanDiscount) =>
  `${formatRate(discount.rate)} ${discount.name}`;
