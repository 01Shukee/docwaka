// src/app/(dashboard)/admin/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IconPlus, IconBuilding } from "@tabler/icons-react";
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
interface DeptRecord { id: string; name: string; _count: { users: number }; }

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [tab, setTab] = useState<Tab>("users");

  useEffect(() => {
    if (session && !["SYS_ADMIN","HOD","DEAN","DEPT_ADMIN"].includes(session.user.role)) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  const [pending,  setPending]  = useState<UserSummary[]>([]);
  const [approved, setApproved] = useState<UserSummary[]>([]);
  const [rejected, setRejected] = useState<UserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setPending(data.pending ?? []); setApproved(data.approved ?? []); setRejected(data.rejected ?? []);
    } catch { toastError("Failed to load users."); }
    finally { setUsersLoading(false); }
  }, [toastError]);

  useEffect(() => { if (tab === "users") fetchUsers(); }, [tab, fetchUsers]);

  const handleUserUpdated = (updated: UserSummary) => {
    const remove = (list: UserSummary[]) => list.filter(u => u.id !== updated.id);
    setPending(remove); setApproved(remove); setRejected(remove);
    if      (updated.status === "PENDING")  setPending(p  => [updated, ...p]);
    else if (updated.status === "APPROVED") setApproved(p => [updated, ...p]);
    else if (updated.status === "REJECTED") setRejected(p => [updated, ...p]);
  };

  const [departments,  setDepartments]  = useState<DeptRecord[]>([]);
  const [deptsLoading, setDeptsLoading] = useState(true);
  const [newDeptName,  setNewDeptName]  = useState("");
  const [newDeptError, setNewDeptError] = useState("");
  const [creatingDept, setCreatingDept] = useState(false);

  const fetchDepts = useCallback(async () => {
    setDeptsLoading(true);
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      setDepartments(data.departments ?? []);
    } catch { toastError("Failed to load departments."); }
    finally { setDeptsLoading(false); }
  }, [toastError]);

  useEffect(() => { if (tab === "departments") fetchDepts(); }, [tab, fetchDepts]);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) { setNewDeptError("Name is required."); return; }
    setCreatingDept(true);
    try {
      const res  = await fetch("/api/admin/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newDeptName.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed.");
      setDepartments(prev => [...prev, data.department].sort((a,b) => a.name.localeCompare(b.name)));
      setNewDeptName("");
      success(`"${data.department.name}" created.`);
    } catch (err) { toastError(err instanceof Error ? err.message : "Failed."); }
    finally { setCreatingDept(false); }
  };

  const isSysAdmin = session?.user?.role === "SYS_ADMIN";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] sm:text-[26px] font-normal leading-tight text-on-surface">Admin</h1>
        <p className="mt-1 text-[13px] text-secondary hidden sm:block">Manage user accounts and system configuration.</p>
      </div>

      {/* Tab strip */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-surface rounded-full w-fit border border-tertiary">
        {(["users", ...(isSysAdmin ? ["departments"] : [])] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={[
            "px-4 py-1.5 rounded-full text-[13px] sm:text-[14px] font-medium capitalize transition-colors",
            tab === t ? "bg-neutral border border-tertiary text-on-surface shadow-sm" : "text-secondary hover:text-on-surface",
          ].join(" ")}>
            {t === "users" ? "Users" : "Departments"}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {tab === "users" && (
        usersLoading ? <FullPageSpinner label="Loading users…" /> : (
          <div className="flex flex-col gap-6 sm:gap-8">
            <section>
              <h2 className="text-[13px] sm:text-[14px] font-semibold text-on-surface mb-3 flex items-center gap-2">
                Pending Approval
                {pending.length > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FFFBEB] text-[#B45309] text-[11px] font-semibold">
                    {pending.length}
                  </span>
                )}
              </h2>
              {pending.length === 0
                ? <EmptyHint text="No pending registrations." />
                : <div className="flex flex-col gap-2">{pending.map(u => <UserCard key={u.id} user={u} onUpdated={handleUserUpdated} />)}</div>
              }
            </section>
            <section>
              <h2 className="text-[13px] sm:text-[14px] font-semibold text-on-surface mb-3">Approved Users</h2>
              {approved.length === 0
                ? <EmptyHint text="No approved users in your scope." />
                : <div className="flex flex-col gap-2">{approved.map(u => <UserCard key={u.id} user={u} onUpdated={handleUserUpdated} />)}</div>
              }
            </section>
            {rejected.length > 0 && (
              <section>
                <h2 className="text-[13px] sm:text-[14px] font-semibold text-on-surface mb-3">Rejected</h2>
                <div className="flex flex-col gap-2">{rejected.map(u => <UserCard key={u.id} user={u} onUpdated={handleUserUpdated} />)}</div>
              </section>
            )}
          </div>
        )
      )}

      {/* Departments tab */}
      {tab === "departments" && isSysAdmin && (
        <div className="flex flex-col gap-4 max-w-2xl">
          <Card padding="md">
            <h2 className="text-[13px] font-semibold text-on-surface mb-3">Add Department</h2>
            <form onSubmit={handleCreateDept} noValidate className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <FormField label="" htmlFor="deptName" error={newDeptError}>
                  <Input id="deptName" type="text" placeholder="e.g. Department of Mathematics" value={newDeptName}
                    onChange={e => { setNewDeptName(e.target.value); setNewDeptError(""); }}
                    disabled={creatingDept} error={!!newDeptError} />
                </FormField>
              </div>
              <Button type="submit" variant="primary" size="md" loading={creatingDept}
                leftIcon={<IconPlus stroke={1.5} size={14} />} className="shrink-0 self-start w-full sm:w-auto">
                Add
              </Button>
            </form>
          </Card>

          <Card padding="none">
            <div className="flex items-center justify-between px-4 py-3 border-b border-tertiary">
              <h2 className="text-[13px] sm:text-[14px] font-semibold text-on-surface">All Departments</h2>
              <span className="text-[12px] text-secondary">{departments.length} total</span>
            </div>
            {deptsLoading ? (
              <div className="py-10 flex justify-center"><FullPageSpinner /></div>
            ) : departments.length === 0 ? (
              <EmptyState icon={IconBuilding} title="No departments yet" description="Add your first department above." />
            ) : (
              <div>{departments.map(d => (
                <DepartmentRow key={d.id} department={d} canDelete={isSysAdmin}
                  onDeleted={id => setDepartments(prev => prev.filter(dep => dep.id !== id))} />
              ))}</div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="py-5 text-center border border-tertiary rounded-md bg-surface/40">
      <p className="text-[13px] text-secondary">{text}</p>
    </div>
  );
}