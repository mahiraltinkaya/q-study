import { describe, expect, it } from "vitest";

import { healthSchema, personalSchema, stepFields } from "@/lib/quote-schema";

const validPersonal = {
  tckn: "10000000146",
  phone: "5321234567",
  email: "mahir@ornek.com",
  occupation: "Doktor",
};

type ParseResult = { error?: { issues: { path: PropertyKey[]; message: string }[] } };

/** Every message zod produced, in order. */
function messageFor(result: ParseResult) {
  return result.error?.issues.map((issue) => issue.message) ?? [];
}

/**
 * First message per field — what react-hook-form surfaces. An empty field trips
 * both the presence check and the format check, but only one is ever shown.
 */
function firstMessagePerField(result: ParseResult) {
  const messages: Record<string, string> = {};
  for (const issue of result.error?.issues ?? []) {
    const field = String(issue.path[0]);
    messages[field] ??= issue.message;
  }
  return messages;
}

describe("personalSchema", () => {
  it("accepts a fully valid step", () => {
    expect(personalSchema.safeParse(validPersonal).success).toBe(true);
  });

  it("reports every empty field rather than stopping at the first", () => {
    const result = personalSchema.safeParse({ tckn: "", phone: "", email: "", occupation: "" });
    expect(firstMessagePerField(result)).toEqual({
      tckn: "Kimlik numarası boş bırakılamaz",
      phone: "Cep telefonu boş bırakılamaz",
      email: "E-posta adresi boş bırakılamaz",
      occupation: "Mesleğinizi seçiniz",
    });
  });

  it("prefers the presence message over the format one on an empty field", () => {
    const result = personalSchema.safeParse({ ...validPersonal, tckn: "" });
    // All three fire; the UI shows the first, so their order is what matters.
    expect(messageFor(result)).toEqual([
      "Kimlik numarası boş bırakılamaz",
      "Kimlik numarası 11 haneli olmalıdır",
      "Geçerli bir kimlik numarası giriniz",
    ]);
  });

  it("rejects a national id that is not 11 digits", () => {
    const result = personalSchema.safeParse({ ...validPersonal, tckn: "123" });
    expect(messageFor(result)).toContain("Kimlik numarası 11 haneli olmalıdır");
  });

  it("rejects a national id whose check digits do not agree", () => {
    const result = personalSchema.safeParse({ ...validPersonal, tckn: "12345678901" });
    expect(messageFor(result)).toContain("Geçerli bir kimlik numarası giriniz");
  });

  it("rejects a national id starting with zero", () => {
    const result = personalSchema.safeParse({ ...validPersonal, tckn: "01234567890" });
    expect(result.success).toBe(false);
  });

  it.each(["5321234567", "05321234567", "0532 123 45 67"])(
    "accepts the mobile number %s regardless of spacing or leading zero",
    (phone) => {
      expect(personalSchema.safeParse({ ...validPersonal, phone }).success).toBe(true);
    },
  );

  it.each(["2121234567", "532123456"])("rejects the non-mobile number %s", (phone) => {
    const result = personalSchema.safeParse({ ...validPersonal, phone });
    expect(messageFor(result)).toContain("Geçerli bir cep telefonu giriniz");
  });

  it("rejects a malformed email", () => {
    const result = personalSchema.safeParse({ ...validPersonal, email: "abc" });
    expect(messageFor(result)).toContain("Geçerli bir e-posta adresi giriniz");
  });
});

describe("healthSchema", () => {
  it.each(["yes", "no"])("accepts the declaration %s", (hasDiagnosis) => {
    expect(healthSchema.safeParse({ hasDiagnosis }).success).toBe(true);
  });

  it("rejects an unanswered declaration", () => {
    const result = healthSchema.safeParse({ hasDiagnosis: "" });
    expect(messageFor(result)).toContain("Lütfen bir seçim yapınız");
  });
});

describe("stepFields", () => {
  it("has one entry per step, aligned with the stepper", () => {
    expect(stepFields).toHaveLength(3);
  });

  it("gates the first two steps and leaves the summary open", () => {
    expect(stepFields[0]).toEqual(["tckn", "phone", "email", "occupation"]);
    expect(stepFields[1]).toEqual(["hasDiagnosis"]);
    expect(stepFields[2]).toEqual([]);
  });
});
