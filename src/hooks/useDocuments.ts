// src/hooks/useDocuments.ts

import useSWR from "swr";
import type { Document } from "@/types/document";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

// ── Inbox ─────────────────────────────────────────────────────────────────────

interface UseInboxReturn {
  documents:    Document[];
  pendingCount: number;
  isLoading:    boolean;
  isError:      boolean;
  mutate:       () => void;
}

export function useInbox(): UseInboxReturn {
  const { data, error, isLoading, mutate } = useSWR<{
    documents:    Document[];
    pendingCount: number;
  }>("/api/documents/inbox", fetcher, {
    refreshInterval: 30_000, // Poll every 30s for new inbox items
  });

  return {
    documents:    data?.documents    ?? [],
    pendingCount: data?.pendingCount ?? 0,
    isLoading,
    isError:      !!error,
    mutate,
  };
}

// ── Outbox ────────────────────────────────────────────────────────────────────

interface UseOutboxReturn {
  documents: Document[];
  isLoading: boolean;
  isError:   boolean;
  mutate:    () => void;
}

export function useOutbox(): UseOutboxReturn {
  const { data, error, isLoading, mutate } = useSWR<{
    documents: Document[];
  }>("/api/documents/outbox", fetcher);

  return {
    documents: data?.documents ?? [],
    isLoading,
    isError:   !!error,
    mutate,
  };
}
