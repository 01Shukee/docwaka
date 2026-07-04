// src/app/(dashboard)/admin/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Building2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { FormField } from "@/components/ui/Input";
import { FullPageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import UserCard from "@/components/admin/UserCard";
import DepartmentRow from "@/components/admin/DepartmentRow";
import { useToast } from "@/components/ui/Toast";
import type { UserSummary } from "@/types/user";

type Tab = "users" | "departments";

interface DeptRecord {
  id:     string;
  name:   string;
  _count: { users: number };
}

/**
 * FSD §4.10 — Admin panel.
 * Tab 1: User management — approve/reject/revoke pending/approved/rejected users
 *   (role-scoped on the API; this page renders what's returned)
 * Tab 2: Department management — SYS_ADMIN only: create and delete departments
 *
 * DESIGN.md: minimal tab strip, card sections, no heavy chrome.
 */
export default function AdminPage() {
  const { data: session } = useSession();
  const router            = useRouter();
  const { success, error: toastError } = useToast();

  const [tab, setTab] = useState<Tab>("users");

  // Redirect non-admin roles
  useEffect(() => {
    if (
      session &&
      !["SYS_ADMIN", "HOD", "DEAN", "DEPT_ADMIN"].includes(session.user.role)
    ) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  // ── Users state ───────────────────────────────────────────────────────────
  const [pending,  setPending]  = useState<UserSummary[]>([]);
  const [approved, setApproved] = useState<UserSummary[]>([]);
  const [rejected, setRejected] = useState<UserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res  = await fetch("/api/admin/users");
      const data = await res.json();
      setPending(data.pending  ?? []);
      setApproved(data.approved ?? []);
      setRejected(data.rejected ?? []);
    } catch {
      toastError("Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (tab === "users") fetchUsers();
  }, [tab, fetchUsers]);

  const handleUserUpdated = (updated: UserSummary) => {
    const replace = (list: UserSummary[]) =>
      list.filter((u) => u.id !== updated.id);

    setPending((p)  => replace(p));
    setApproved((p) => replace(p));
    setRejected((p) => replace(p));

    if      (updated.status === "PENDING")  setPending((p)  => [updated, ...p]);
    else if (updated.status === "APPROVED") setApproved((p) => [updated, ...p]);
    else if (updated.status === "REJECTED") setRejected((p) => [updated, ...p]);
  };

  // ── Departments state ─────────────────────────────────────────────────────
  const [departments,     setDepartments]     = useState<DeptRecord[]>([]);
  const [deptsLoading,    setDeptsLoading]    = useState(true);
  const [newDeptName,     setNewDeptName]     = useState("");
  const [newDeptError,    setNewDeptError]    = useState("");
  const [creatingDept,    setCreatingDept]    = useState(false);

  const fetchDepts = useCallback(async () => {
    setDeptsLoading(true);
    try {
      const res  = await fetch("/api/admin/departments");
      const data = await res.json();
      setDepartments(data.departments ?? []);
    } catch {
      toastError("Failed to load departments.");
    } finally {
      setDeptsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (tab === "departments") fetchDepts();
  }, [tab, fetchDepts]);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      setNewDeptError("Department name is required.");
      return;
    }
    setCreatingDept(true);
    try {
      const res  = await fetch("/api/admin/departments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: newDeptName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create department.");
      setDepartments((prev) => [...prev, data.department].sort((a, b) => a.name.localeCompare(b.name)));
      setNewDeptName("");
      success(`Department "${data.department.name}" created.`);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to create.");
    } finally {
      setCreatingDept(false);
    }
  };

  const isSysAdmin = session?.user?.role === "SYS_ADMIN";

  return (
    <div>
      {/* ── Page heading ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-[26px] font-normal leading-[31px] text-on-surface">
          Admin
        </h1>
        <p className="mt-1 text-[14px] leading-5 text-secondary">
          Manage user accounts and system configuration.
        </p>
      </div>

      {/* ── Tab strip ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-surface rounded-full w-fit border border-tertiary">
        {(["users", ...(isSysAdmin ? ["departments"] : [])] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "px-4 py-1.5 rounded-full text-[14px] font-medium capitalize transition-colors duration-100",
              tab === t
                ? "bg-neutral border border-tertiary text-on-surface shadow-sm"
                : "text-secondary hover:text-on-surface",
            ].join(" ")}
          >
            {t === "users" ? "Users" : "Departments"}
          </button>
        ))}
      </div>

      {/* ── Users tab ────────────────────────────────────────────────── */}
      {tab === "users" && (
        usersLoading ? <FullPageSpinner label="Loading users…" /> : (
          <div className="flex flex-col gap-8">

            {/* Pending */}
            <section>
              <h2 className="text-[14px] font-semibold text-on-surface mb-3 flex items-center gap-2">
                Pending Approval
                {pending.length > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-[11px] font-semibold">
                    {pending.length}
                  </span>
                )}
              </h2>
              {pending.length === 0 ? (
                <EmptyListHint text="No pending registrations." />
              ) : (
                <div className="flex flex-col gap-2">
                  {pending.map((u) => (
                    <UserCard key={u.id} user={u} onUpdated={handleUserUpdated} />
                  ))}
                </div>
              )}
            </section>

            {/* Approved */}
            <section>
              <h2 className="text-[14px] font-semibold text-on-surface mb-3">
                Approved Users
              </h2>
              {approved.length === 0 ? (
                <EmptyListHint text="No approved users in your scope." />
              ) : (
                <div className="flex flex-col gap-2">
                  {approved.map((u) => (
                    <UserCard key={u.id} user={u} onUpdated={handleUserUpdated} />
                  ))}
                </div>
              )}
            </section>

            {/* Rejected */}
            {rejected.length > 0 && (
              <section>
                <h2 className="text-[14px] font-semibold text-on-surface mb-3">
                  Rejected
                </h2>
                <div className="flex flex-col gap-2">
                  {rejected.map((u) => (
                    <UserCard key={u.id} user={u} onUpdated={handleUserUpdated} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      )}

      {/* ── Departments tab ───────────────────────────────────────────── */}
      {tab === "departments" && isSysAdmin && (
        <div className="max-w-2xl flex flex-col gap-6">

          {/* Create department */}
          <Card padding="lg">
            <h2 className="text-[15px] font-semibold text-on-surface mb-4">
              Add Department
            </h2>
            <form onSubmit={handleCreateDept} noValidate className="flex gap-2">
              <div className="flex-1">
                <FormField
                  label=""
                  htmlFor="deptName"
                  error={newDeptError}
                >
                  <Input
                    id="deptName"
                    type="text"
                    placeholder="e.g. Department of Mathematics"
                    value={newDeptName}
                    onChange={(e) => { setNewDeptName(e.target.value); setNewDeptError(""); }}
                    disabled={creatingDept}
                    error={!!newDeptError}
                  />
                </FormField>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={creatingDept}
                leftIcon={<Plus size={14} />}
                className="shrink-0 self-start mt-[1px]"
              >
                Add
              </Button>
            </form>
          </Card>

          {/* Department list */}
          <Card padding="none">
            <div className="flex items-center justify-between px-4 py-3 border-b border-tertiary">
              <h2 className="text-[15px] font-semibold text-on-surface">
                All Departments
              </h2>
              <span className="text-[13px] text-secondary">
                {departments.length} total
              </span>
            </div>

            {deptsLoading ? (
              <div className="py-10 flex justify-center">
                <FullPageSpinner label="Loading…" />
              </div>
            ) : departments.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No departments yet"
                description="Add your first department above."
              />
            ) : (
              <div>
                {departments.map((dept) => (
                  <DepartmentRow
                    key={dept.id}
                    department={dept}
                    canDelete={isSysAdmin}
                    onDeleted={(deletedId) =>
                      setDepartments((prev) => prev.filter((d) => d.id !== deletedId))
                    }
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function EmptyListHint({ text }: { text: string }) {
  return (
    <div className="py-6 text-center border border-tertiary rounded-md bg-surface/40">
      <p className="text-[13px] text-secondary">{text}</p>
    </div>
  );
}
