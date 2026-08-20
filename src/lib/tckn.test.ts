import { describe, expect, it } from "vitest";

import { isValidTckn } from "@/lib/tckn";

// Check-digit-correct numbers. They are structurally valid, not issued.
const VALID = ["10000000146", "11111111110"];

describe("isValidTckn", () => {
  it.each(VALID)("accepts %s, whose check digits agree", (value) => {
    expect(isValidTckn(value)).toBe(true);
  });

  it("ignores spacing, so a pasted number still validates", () => {
    expect(isValidTckn("100 000 001 46")).toBe(true);
  });

  it("rejects a number whose check digits do not agree", () => {
    // Right shape, right length, wrong last two digits — exactly what the old
    // regex-only rule let through.
    expect(isValidTckn("12345678901")).toBe(false);
  });

  it("rejects the tenth digit being off by one", () => {
    expect(isValidTckn("10000000156")).toBe(false);
  });

  it("rejects the eleventh digit being off by one", () => {
    expect(isValidTckn("10000000147")).toBe(false);
  });

  it("rejects a leading zero", () => {
    expect(isValidTckn("01234567890")).toBe(false);
  });

  it.each(["", "123", "1000000014", "100000001466", "abcdefghijk"])(
    "rejects %s on length or content",
    (value) => {
      expect(isValidTckn(value)).toBe(false);
    },
  );
});
