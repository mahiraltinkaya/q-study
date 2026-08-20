import { connection } from "next/server";

import { QuoteFlow } from "@/components/steps/quote-flow";
import type { StepItem } from "@/components/ui/stepper";
import { PersonalInformation } from "@/components/steps/personal-information";
import { HealthInformation } from "@/components/steps/health-information";
import { SummaryDetail } from "@/components/steps/summary-detail";
import { ErrorBoundary } from "@/components/shared/error-boundary";

const steps: StepItem[] = [
  { label: "Kişisel Bilgiler" },
  { label: "Sağlık Bilgileri" },
  { label: "Teklif Detayları" },
];

export default async function Home() {
  await connection();

  return (
    <div className="bg-surface flex min-h-screen flex-col items-center overflow-x-clip px-4 py-10 md:py-14">
      <main className="flex w-full max-w-280 flex-col">
        <h1 className="font-cordale mb-8 text-center text-2xl font-bold tracking-tight text-zinc-900 md:mb-10 md:text-3xl">
          <span className="text-brand font-cordale">Tamamlayıcı Sağlık Sigortası</span> Satın Al
        </h1>
        <ErrorBoundary>
          <QuoteFlow steps={steps}>
            <PersonalInformation />
            <HealthInformation />
            <SummaryDetail />
          </QuoteFlow>
        </ErrorBoundary>
      </main>
    </div>
  );
}
