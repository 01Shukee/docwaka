// src/hooks/useAdminUsers.ts

import useSWR from "swr";
import type { UserSummary } from "@/types/user";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

// ── Admin Users ───────────────────────────────────────────────────────────────

interface UseAdminUsersReturn {
  pending:   UserSummary[];
  approved:  UserSummary[];
  rejected:  UserSummary[];
  isLoading: boolean;
  isError:   boolean;
  mutate:    () => void;
}

export function useAdminUsers(): UseAdminUsersReturn {
  const { data, error, isLoading, mutate } = useSWR<{
    pending:  UserSummary[];
    approved: UserSummary[];
    rejected: UserSummary[];
  }>("/api/admin/users", fetcher);

  return {
    pending:   data?.pending  ?? [],
    approved:  data?.approved ?? [],
    rejected:  data?.rejected ?? [],
    isLoading,
    isError:   !!error,
    mutate,
  };
}

// ── Departments ───────────────────────────────────────────────────────────────

interface Department {
  id:     string;
  name:   string;
  _count: { users: number };
}

export function useAdminDepartments() {
  const { data, error, isLoading, mutate } = useSWR<{
    departments: Department[];
  }>("/api/admin/departments", fetcher);

  return {
    departments: data?.departments ?? [],
    isLoading,
    isError:     !!error,
    mutate,
  };
}

// ── Recipients ────────────────────────────────────────────────────────────────

interface Recipient {
  id:         string;
  name:       string;
  email:      string;
  role:       string;
  department: { id: string; name: string };
}

export function useRecipients() {
  const { data, error, isLoading } = useSWR<{
    recipients: Recipient[];
  }>("/api/recipients", fetcher);

  return {
    recipients: data?.recipients ?? [],
    isLoading,
    isError:    !!error,
  };
}
