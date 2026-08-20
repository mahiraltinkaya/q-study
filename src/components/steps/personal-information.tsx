"use client";

import { User, Phone, Mail, Briefcase } from "lucide-react";

import { StepCard } from "@/components/steps/step-card";
import { FormInput } from "@/components/steps/form-input";
import { FormSelect } from "@/components/steps/form-select";
import { useOccupations } from "@/hooks/use-occupations";
import { KvkkNotice } from "@/components/steps/kvkk-notice";
import { digits } from "@/lib/normalize";
import type { QuoteFormValues } from "@/lib/quote-schema";

const TCKN_ICON = <User className="size-4" />;
const PHONE_ICON = <Phone className="size-4" />;
const MAIL_ICON = <Mail className="size-4" />;
const JOB_ICON = <Briefcase className="size-4" />;

const TCKN_TOOLTIP = {
  title: "Kimlik Numarası",
  description: "Teklifinizi hazırlayabilmemiz için T.C. kimlik numaranız gereklidir.",
};
const PHONE_TOOLTIP = {
  title: "Cep Telefonu",
  description:
    "Kimlik doğrulama işlemleriniz için bu bilgi gereklidir. Cep telefonunuz başkaları tarafından görülemez.",
};
const MAIL_TOOLTIP = {
  title: "E-posta Adresi",
  description: "Teklifiniz ve poliçe belgeleriniz bu e-posta adresine gönderilecektir.",
};
const JOB_TOOLTIP = {
  title: "Mesleğiniz",
  description: "Mesleğiniz, teminat kapsamınızı ve prim tutarınızı etkileyebilir.",
};

function PersonalInformation() {
  const { occupations, loading, error } = useOccupations();

  return (
    <StepCard
      title={
        <>
          Teklifinizi hazırlayabilmemiz için <span className="text-brand">aşağıdaki bilgileri</span>{" "}
          paylaşabilir misiniz?
        </>
      }
    >
      <FormInput<QuoteFormValues>
        name="tckn"
        label="Kimlik Numarası"
        placeholder="Kimlik Numaranız"
        inputMode="numeric"
        maxLength={11}
        autoComplete="off"
        normalize={digits}
        icon={TCKN_ICON}
        tooltip={TCKN_TOOLTIP}
      />
      <FormInput<QuoteFormValues>
        name="phone"
        label="Cep Telefonu"
        placeholder="Cep Telefonunuz"
        type="tel"
        inputMode="tel"
        maxLength={11}
        autoComplete="tel"
        normalize={digits}
        icon={PHONE_ICON}
        tooltip={PHONE_TOOLTIP}
      />
      <FormInput<QuoteFormValues>
        name="email"
        label="E-posta Adresi"
        placeholder="örnek@mail.com"
        type="email"
        autoComplete="email"
        icon={MAIL_ICON}
        tooltip={MAIL_TOOLTIP}
      />
      <FormSelect<QuoteFormValues>
        name="occupation"
        label="Mesleğiniz"
        placeholder={loading ? "Yükleniyor..." : (error ?? "Mesleğiniz")}
        options={occupations}
        disabled={loading || Boolean(error)}
        icon={JOB_ICON}
        tooltip={JOB_TOOLTIP}
      />
      <KvkkNotice />
    </StepCard>
  );
}

export { PersonalInformation };
