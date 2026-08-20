// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The policy is a string, so its shape can be asserted cheaply — and it is the
 * app's main security control, which makes "cheap" the wrong reason not to.
 *
 * `ANALYTICS_ORIGIN` is resolved once at module load, so every case that changes
 * the environment has to re-import the module rather than reuse it.
 */
async function policyFor(env: Record<string, string | undefined> = {}) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) vi.stubEnv(key, "");
    else vi.stubEnv(key, value);
  }

  const { proxy } = await import("@/proxy");
  const response = proxy(new NextRequest("https://example.test/teklif"));
  return response.headers.get("Content-Security-Policy") ?? "";
}

/** The directive body, without its name. */
function directive(policy: string, name: string) {
  const found = policy.split("; ").find((part) => part === name || part.startsWith(`${name} `));
  return found?.slice(name.length).trim();
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Content-Security-Policy", () => {
  it("mints a fresh nonce per request", async () => {
    const [first, second] = [await policyFor(), await policyFor()];

    const nonceOf = (policy: string) => /'nonce-([a-f0-9]+)'/.exec(policy)?.[1];
    expect(nonceOf(first)).toBeTruthy();
    expect(nonceOf(first)).not.toBe(nonceOf(second));
  });

  it("carries the nonce on script-src alongside strict-dynamic", async () => {
    const scripts = directive(await policyFor(), "script-src");

    expect(scripts).toMatch(/'nonce-[a-f0-9]+'/);
    expect(scripts).toContain("'strict-dynamic'");
  });

  it("keeps the style-src-attr escape hatch", async () => {
    // Base UI positions popups with inline `style` attributes, and a nonce never
    // applies to an attribute. Losing this line renders the dropdown unpositioned.
    expect(directive(await policyFor(), "style-src-attr")).toBe("'unsafe-inline'");
  });

  it("locks down the directives an injected document would reach for", async () => {
    const policy = await policyFor();

    expect(directive(policy, "object-src")).toBe("'none'");
    expect(directive(policy, "frame-ancestors")).toBe("'none'");
    expect(directive(policy, "base-uri")).toBe("'self'");
    expect(directive(policy, "form-action")).toBe("'self'");
    expect(policy).toContain("upgrade-insecure-requests");
  });

  it("allows nothing beyond itself to be called when no analytics endpoint is set", async () => {
    expect(directive(await policyFor(), "connect-src")).toBe("'self'");
  });

  it("allows the analytics origin, and only its origin", async () => {
    const connect = directive(
      await policyFor({ NEXT_PUBLIC_WEB_VITALS_URL: "https://metrics.example.com/v1/vitals?a=1" }),
      "connect-src",
    );

    expect(connect).toBe("'self' https://metrics.example.com");
  });

  it("falls back to self rather than emitting a broken source when the URL is malformed", async () => {
    // The catch in `originOf` exists for this; without the test nothing proves a
    // typo in the variable degrades quietly instead of corrupting the directive.
    const connect = directive(
      await policyFor({ NEXT_PUBLIC_WEB_VITALS_URL: "metrics.example.com" }),
      "connect-src",
    );

    expect(connect).toBe("'self'");
  });

  it("does not hand production the eval that only development needs", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(directive(await policyFor(), "script-src")).not.toContain("'unsafe-eval'");
  });
});
