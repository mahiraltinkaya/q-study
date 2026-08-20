import { describe, expect, it } from "vitest";

import { getStepStatus } from "@/components/ui/stepper/types";

describe("getStepStatus", () => {
  it("marks earlier steps completed, the active one current, and the rest upcoming", () => {
    expect([0, 1, 2, 3].map((index) => getStepStatus(index, 2))).toEqual([
      "completed",
      "completed",
      "current",
      "upcoming",
    ]);
  });

  it("has no completed steps on the first step", () => {
    expect([0, 1, 2].map((index) => getStepStatus(index, 0))).toEqual([
      "current",
      "upcoming",
      "upcoming",
    ]);
  });
});
