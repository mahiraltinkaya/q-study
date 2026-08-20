import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "@/components/shared/error-boundary";

/** Throwing is driven from outside so a retry can succeed the second time. */
let shouldThrow = true;

function Subject() {
  if (shouldThrow) throw new Error("teklif hesaplanamadı");
  return <p>içerik</p>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders its children while nothing throws", () => {
    shouldThrow = false;
    render(
      <ErrorBoundary>
        <Subject />
      </ErrorBoundary>,
    );
    expect(screen.getByText("içerik")).toBeInTheDocument();
  });

  it("swaps in the fallback when the subtree throws", () => {
    render(
      <ErrorBoundary>
        <Subject />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Beklenmeyen bir durumla karşılaştık");
  });

  it("offers a retry, so a render error is not terminal", async () => {
    render(
      <ErrorBoundary>
        <Subject />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    await userEvent.click(screen.getByRole("button", { name: /Tekrar Deneyin/i }));

    expect(screen.getByText("içerik")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reports the error to the side channel", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Subject />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("lets a caller replace the fallback and drive the reset", async () => {
    render(
      <ErrorBoundary
        fallback={(error, retry) => (
          <button type="button" onClick={retry}>
            {error.message}
          </button>
        )}
      >
        <Subject />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    await userEvent.click(screen.getByRole("button", { name: "teklif hesaplanamadı" }));

    expect(screen.getByText("içerik")).toBeInTheDocument();
  });
});
