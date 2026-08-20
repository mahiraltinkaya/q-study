import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormContext } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { QuoteFlow } from "@/components/steps/quote-flow";
import { StepCard } from "@/components/steps/step-card";
import { StepPanel } from "@/components/steps/step-panel";
import { FormInput } from "@/components/steps/form-input";
import { digits } from "@/lib/normalize";
import type { QuoteFormValues } from "@/lib/quote-schema";
import type { StepItem } from "@/components/ui/stepper";

const steps: StepItem[] = [
  { label: "Kişisel Bilgiler" },
  { label: "Sağlık Bilgileri" },
  { label: "Teklif Detayları" },
];

const VALID = {
  tckn: "10000000146",
  phone: "5321234567",
  email: "mahir@ornek.com",
  occupation: "Doktor",
};

/**
 * Fills the step in one click. The occupation control is a Base UI popup that
 * jsdom cannot position, so the values go in through the form context — the
 * gate under test reads the form, not the DOM.
 */
function Fill() {
  const { setValue } = useFormContext<QuoteFormValues>();
  return (
    <button
      type="button"
      onClick={() => {
        for (const [name, value] of Object.entries(VALID)) {
          setValue(name as keyof QuoteFormValues, value);
        }
      }}
    >
      doldur
    </button>
  );
}

function renderFlow() {
  return render(
    <QuoteFlow steps={steps}>
      <StepCard title="Kişisel Bilgiler">
        <FormInput<QuoteFormValues>
          name="tckn"
          label="Kimlik Numarası"
          maxLength={11}
          normalize={digits}
        />
        <Fill />
      </StepCard>
      <StepPanel title="Sağlık Bilgileri">
        <p>sağlık adımı</p>
      </StepPanel>
      <StepPanel title="Teklif Detayları">
        <p>özet adımı</p>
      </StepPanel>
    </QuoteFlow>,
  );
}

const submit = () => screen.getByRole("button", { name: /Devam Et/i });
const onHealthStep = () => screen.queryByText("sağlık adımı") !== null;

describe("QuoteFlow validation gate", () => {
  it("refuses to advance while the step is empty", async () => {
    renderFlow();
    await userEvent.click(submit());

    expect(onHealthStep()).toBe(false);
  });

  it("surfaces a message for the empty field it blocked on", async () => {
    renderFlow();
    await userEvent.click(submit());

    expect(await screen.findByRole("alert")).toHaveTextContent("Kimlik numarası boş bırakılamaz");
  });

  it("ties the message to the control with aria-describedby", async () => {
    renderFlow();
    await userEvent.click(submit());

    const field = screen.getByLabelText("Kimlik Numarası");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAttribute("aria-describedby", "tckn-error");
    expect(document.getElementById("tckn-error")).toHaveTextContent(
      "Kimlik numarası boş bırakılamaz",
    );
  });

  it("advances once every field on the step is valid", async () => {
    renderFlow();
    await userEvent.click(screen.getByRole("button", { name: "doldur" }));
    await userEvent.click(submit());

    expect(await screen.findByText("sağlık adımı")).toBeInTheDocument();
  });

  it("blocks a national id that passes the length rule but fails its check digits", async () => {
    renderFlow();
    await userEvent.click(screen.getByRole("button", { name: "doldur" }));
    await userEvent.clear(screen.getByLabelText("Kimlik Numarası"));
    await userEvent.type(screen.getByLabelText("Kimlik Numarası"), "12345678901");
    await userEvent.click(submit());

    expect(onHealthStep()).toBe(false);
    expect(await screen.findByRole("alert")).toHaveTextContent("Geçerli bir kimlik numarası");
  });

  it("strips the spacing out of a pasted number so maxLength cannot truncate it", async () => {
    renderFlow();
    const field = screen.getByLabelText("Kimlik Numarası");

    await userEvent.click(field);
    await userEvent.paste("100 000 001 46");

    expect(field).toHaveValue("10000000146");
  });
});
