// src/hooks/useDocument.ts

import useSWR from "swr";
import type { DocumentDetail } from "@/types/document";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function useDocument(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{
    document: DocumentDetail;
  }>(id ? `/api/documents/${id}` : null, fetcher);

  return {
    document:  data?.document ?? null,
    isLoading,
    isError:   !!error,
    mutate,
  };
}
