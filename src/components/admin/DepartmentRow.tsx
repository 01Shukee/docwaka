// src/components/admin/DepartmentRow.tsx
"use client";

import { useState } from "react";
import { IconTrash, IconCheck, IconX, IconUsersGroup } from "@tabler/icons-react";
import { useToast } from "@/components/ui/Toast";

interface DepartmentRowProps {
  department: { id: string; name: string; _count: { users: number } };
  canDelete:  boolean;
  onDeleted:  (id: string) => void;
}

export default function DepartmentRow({ department, canDelete, onDeleted }: DepartmentRowProps) {
  const { success, error: toastError } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res  = await fetch(`/api/admin/departments?id=${department.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete.");
      success(`"${department.name}" deleted.`);
      onDeleted(department.id);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Delete failed.");
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-tertiary last:border-none hover:bg-surface/40 transition-colors group">
      <div className="w-7 h-7 rounded-md bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
        <IconUsersGroup stroke={1.5} size={13} className="text-[#3B82F6]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-on-surface truncate">{department.name}</p>
        <p className="text-[11px] text-secondary">
          {department._count.users} user{department._count.users !== 1 ? "s" : ""}
        </p>
      </div>

      {canDelete && (
        <div className="shrink-0 flex items-center gap-1.5">
          {confirming ? (
            <>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-error text-white text-[11px] font-semibold hover:opacity-85 transition-opacity disabled:opacity-50">
                <IconCheck stroke={1.5} size={12} />
                {deleting ? "Deleting…" : "Confirm"}
              </button>
              <button onClick={() => setConfirming(false)} disabled={deleting}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface border border-tertiary text-[11px] font-medium text-secondary hover:text-on-surface transition-colors">
                <IconX stroke={1.5} size={12} />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                if (department._count.users > 0) {
                  toastError("Cannot delete — department has users assigned.");
                  return;
                }
                setConfirming(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-secondary hover:text-error hover:bg-red-50 transition-all"
              aria-label={`Delete ${department.name}`}
            >
              <IconTrash stroke={1.5} size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}