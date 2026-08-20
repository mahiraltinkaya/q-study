import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useOccupations } from "@/hooks/use-occupations";

const getOccupations = vi.hoisted(() => vi.fn());
vi.mock("@/app/actions/occupations", () => ({ getOccupations }));

/**
 * The three states this hook exposes all reach the user as the occupation
 * select's placeholder, so the mapping is user-visible copy rather than
 * internal bookkeeping — a silent change to it shows up on the form.
 */
function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  getOccupations.mockReset();
});

describe("useOccupations", () => {
  it("reports loading with an empty list rather than undefined", () => {
    getOccupations.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useOccupations(), { wrapper });

    expect(result.current).toEqual({ occupations: [], loading: true, error: null });
  });

  it("hands back the list once it arrives", async () => {
    getOccupations.mockResolvedValue(["Doktor", "Mühendis"]);

    const { result } = renderHook(() => useOccupations(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.occupations).toEqual(["Doktor", "Mühendis"]);
    expect(result.current.error).toBeNull();
  });

  it("turns a failure into a message the select can show, not an empty dropdown", async () => {
    getOccupations.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useOccupations(), { wrapper });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toBe("Meslek listesi yüklenemedi.");
    expect(result.current.occupations).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
