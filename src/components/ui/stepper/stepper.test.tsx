import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Stepper } from "@/components/ui/stepper";
import type { StepItem } from "@/components/ui/stepper";

const steps: StepItem[] = [
  { label: "Kişisel Bilgiler" },
  { label: "Sağlık Bilgileri" },
  { label: "Teklif Detayları" },
];

/** One rail at every width; below md only the active label is visible. */
function railItems() {
  return document.querySelectorAll("nav[data-slot=stepper] [data-slot=stepper-item]");
}

describe("Stepper", () => {
  it("renders every step label", () => {
    render(<Stepper steps={steps} currentStep={0} />);
    for (const step of steps) {
      expect(screen.getAllByText(step.label).length).toBeGreaterThan(0);
    }
  });

  it("marks the active step with aria-current and numbers the rest", () => {
    render(<Stepper steps={steps} currentStep={1} />);
    const statuses = [...railItems()].map((el) => el.getAttribute("data-status"));
    expect(statuses).toEqual(["completed", "current", "upcoming"]);
    expect(railItems()[1]).toHaveAttribute("aria-current", "step");
  });

  it("only makes visited steps clickable, so forward jumps stay closed", () => {
    render(<Stepper steps={steps} currentStep={1} onStepChange={vi.fn()} />);
    const tags = [...railItems()].map((el) => el.tagName);
    expect(tags).toEqual(["BUTTON", "DIV", "DIV"]);
  });

  it("reports the target index when a visited step is pressed", async () => {
    const onStepChange = vi.fn();
    render(<Stepper steps={steps} currentStep={2} onStepChange={onStepChange} />);

    await userEvent.click(screen.getByRole("button", { name: /Kişisel Bilgiler/ }));

    expect(onStepChange).toHaveBeenCalledExactlyOnceWith(0);
  });

  it("renders no clickable step when nothing has been visited", () => {
    render(<Stepper steps={steps} currentStep={0} onStepChange={vi.fn()} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
