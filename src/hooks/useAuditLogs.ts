// src/hooks/useAuditLogs.ts

import useSWR from "swr";
import type { AuditLog } from "@/types/document";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

interface Pagination {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

interface UseAuditLogsParams {
  search?: string;
  page?:   number;
  limit?:  number;
}

export function useAuditLogs({
  search = "",
  page   = 1,
  limit  = 50,
}: UseAuditLogsParams = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page",  String(page));
  params.set("limit", String(limit));

  const { data, error, isLoading, mutate } = useSWR<{
    logs:       AuditLog[];
    pagination: Pagination;
  }>(`/api/audit?${params.toString()}`, fetcher);

  return {
    logs:       data?.logs       ?? [],
    pagination: data?.pagination ?? { page, limit, total: 0, totalPages: 0 },
    isLoading,
    isError:    !!error,
    mutate,
  };
}
