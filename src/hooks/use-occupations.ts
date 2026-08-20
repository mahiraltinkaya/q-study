"use client";

import { useQuery } from "@tanstack/react-query";

import { getOccupations } from "@/app/actions/occupations";

export const occupationsQueryKey = ["occupations"] as const;

export interface OccupationsState {
  occupations: string[];
  loading: boolean;
  error: string | null;
}

export function useOccupations(): OccupationsState {
  const { data, isPending, isError } = useQuery({
    queryKey: occupationsQueryKey,
    queryFn: () => getOccupations(),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  return {
    occupations: data ?? [],
    loading: isPending,
    error: isError ? "Meslek listesi yüklenemedi." : null,
  };
}
