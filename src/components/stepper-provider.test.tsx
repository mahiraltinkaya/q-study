import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StepperProvider, useStepper } from "@/components/stepper-provider";
import { StepperView } from "@/components/stepper-view";
import type { StepItem } from "@/components/ui/stepper";

const steps: StepItem[] = [
  { label: "Kişisel Bilgiler" },
  { label: "Sağlık Bilgileri" },
  { label: "Teklif Detayları" },
];

function Controls() {
  const { goNext, goBack, currentStep, isFirstStep, isLastStep } = useStepper();
  return (
    <div>
      <button type="button" onClick={() => void goNext()}>
        ileri
      </button>
      <button type="button" onClick={goBack}>
        geri
      </button>
      <span data-testid="index">{currentStep}</span>
      <span data-testid="edges">{`${isFirstStep}/${isLastStep}`}</span>
    </div>
  );
}

function renderFlow(beforeNext?: (index: number) => boolean | Promise<boolean>) {
  return render(
    <StepperProvider steps={steps} beforeNext={beforeNext}>
      <Controls />
      <StepperView>
        <p>birinci adım</p>
        <p>ikinci adım</p>
        <p>üçüncü adım</p>
      </StepperView>
    </StepperProvider>,
  );
}

const index = () => screen.getByTestId("index").textContent;

describe("StepperProvider", () => {
  it("renders only the child sitting at the active index", () => {
    renderFlow();
    expect(screen.getByText("birinci adım")).toBeInTheDocument();
    expect(screen.queryByText("ikinci adım")).not.toBeInTheDocument();
  });

  it("advances when no guard objects", async () => {
    renderFlow();
    await userEvent.click(screen.getByRole("button", { name: "ileri" }));
    expect(index()).toBe("1");
    expect(screen.getByText("ikinci adım")).toBeInTheDocument();
  });

  it("stays put when the guard refuses", async () => {
    const beforeNext = vi.fn().mockResolvedValue(false);
    renderFlow(beforeNext);

    await userEvent.click(screen.getByRole("button", { name: "ileri" }));

    expect(beforeNext).toHaveBeenCalledExactlyOnceWith(0);
    expect(index()).toBe("0");
    expect(screen.getByText("birinci adım")).toBeInTheDocument();
  });

  it("passes the index it is leaving to the guard", async () => {
    const beforeNext = vi.fn().mockResolvedValue(true);
    renderFlow(beforeNext);

    await userEvent.click(screen.getByRole("button", { name: "ileri" }));
    await userEvent.click(screen.getByRole("button", { name: "ileri" }));

    expect(beforeNext.mock.calls).toEqual([[0], [1]]);
  });

  it("goes back", async () => {
    renderFlow();
    await userEvent.click(screen.getByRole("button", { name: "ileri" }));
    await userEvent.click(screen.getByRole("button", { name: "geri" }));
    expect(index()).toBe("0");
  });

  it("clamps at the first step rather than going negative", async () => {
    renderFlow();
    await userEvent.click(screen.getByRole("button", { name: "geri" }));
    expect(index()).toBe("0");
  });

  it("clamps at the last step rather than running off the end", async () => {
    renderFlow();
    const next = screen.getByRole("button", { name: "ileri" });
    for (let i = 0; i < 5; i += 1) await userEvent.click(next);

    expect(index()).toBe("2");
    expect(screen.getByText("üçüncü adım")).toBeInTheDocument();
  });

  it("reports which edges it is on", async () => {
    renderFlow();
    expect(screen.getByTestId("edges").textContent).toBe("true/false");
    await userEvent.click(screen.getByRole("button", { name: "ileri" }));
    expect(screen.getByTestId("edges").textContent).toBe("false/false");
  });

  it("announces the active step, since swapping the panel is otherwise silent", async () => {
    renderFlow();
    const live = document.querySelector("[aria-live=polite]");
    expect(live).toHaveTextContent("Adım 1 / 3: Kişisel Bilgiler");

    await userEvent.click(screen.getByRole("button", { name: "ileri" }));
    expect(live).toHaveTextContent("Adım 2 / 3: Sağlık Bilgileri");
  });

  it("refuses to be used outside a provider", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Controls />)).toThrow(/useStepper must be used within/);
    quiet.mockRestore();
  });
});
