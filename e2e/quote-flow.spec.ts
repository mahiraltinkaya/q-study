import { expect, test, type Page } from "@playwright/test";

/**
 * Smoke coverage for the three-step flow in a real browser.
 *
 * Scoped deliberately: the unit suite already pins validation messages, check
 * digits and normalisation. What only a browser can prove is that the occupation
 * popup opens and commits a value, that the CSP does not block the bundle it
 * nonces, and that stepping back does not discard what was typed.
 */

const APPLICANT = {
  tckn: "10000000146",
  phone: "5321234567",
  email: "mahir@ornek.com",
  occupation: "Doktor",
};

async function fillPersonalStep(page: Page) {
  await page.getByLabel("Kimlik Numarası").fill(APPLICANT.tckn);
  await page.getByLabel("Cep Telefonu").fill(APPLICANT.phone);
  await page.getByLabel("E-posta Adresi").fill(APPLICANT.email);

  await page.getByLabel("Mesleğiniz").click();
  await page.getByRole("option", { name: APPLICANT.occupation, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("walks the applicant from personal details to the plan offers", async ({ page }) => {
  // The rail says "Kişisel Bilgiler"; the panel's own heading is the question.
  await expect(page.getByRole("heading", { name: /Teklifinizi hazırlayabilmemiz/ })).toBeVisible();

  await fillPersonalStep(page);
  await page.getByRole("button", { name: "Devam Et" }).click();

  await expect(page.getByText("Teklif için son bir adım kaldı.")).toBeVisible();
  await page.getByRole("button", { name: /Hayır, Teşhis/ }).click();

  await expect(page.getByText(/en uygun plan önerilerimizi/)).toBeVisible();
});

test("refuses to advance while the step is incomplete", async ({ page }) => {
  await page.getByRole("button", { name: "Devam Et" }).click();

  await expect(page.getByText("Kimlik numarası boş bırakılamaz")).toBeVisible();
  await expect(page.getByText("Teklif için son bir adım kaldı.")).toBeHidden();
});

test("commits the occupation the popup selected", async ({ page }) => {
  // The control jsdom cannot drive: the value has to survive a real open,
  // highlight and commit rather than being written straight into form state.
  await page.getByLabel("Mesleğiniz").click();
  await page.getByRole("option", { name: APPLICANT.occupation, exact: true }).click();

  await expect(page.getByLabel("Mesleğiniz")).toContainText(APPLICANT.occupation);
});

test("keeps what was typed when the applicant steps back", async ({ page }) => {
  await fillPersonalStep(page);
  await page.getByRole("button", { name: "Devam Et" }).click();
  await expect(page.getByText("Teklif için son bir adım kaldı.")).toBeVisible();

  // The completed step is reachable from the rail; the panel underneath is
  // remounted, so anything not held in form state would come back empty.
  await page.getByRole("button", { name: /Kişisel Bilgiler/ }).click();

  await expect(page.getByLabel("Kimlik Numarası")).toHaveValue(APPLICANT.tckn);
  await expect(page.getByLabel("E-posta Adresi")).toHaveValue(APPLICANT.email);
  await expect(page.getByLabel("Mesleğiniz")).toContainText(APPLICANT.occupation);
});

test("serves a nonce-based policy and runs the bundle it allows", async ({ page }) => {
  const response = await page.goto("/");
  const policy = response?.headers()["content-security-policy"] ?? "";

  expect(policy).toMatch(/script-src [^;]*'nonce-[a-f0-9]+'/);
  expect(policy).toContain("style-src-attr 'unsafe-inline'");

  // Hydration is the proof the policy did not block its own bundle: an inert
  // page would never reach the validation message below.
  await page.getByRole("button", { name: "Devam Et" }).click();
  await expect(page.getByText("Kimlik numarası boş bırakılamaz")).toBeVisible();
});
