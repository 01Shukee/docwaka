// src/components/admin/DepartmentRow.tsx

"use client";

import { useState } from "react";
import { Building2, Trash2, Users } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface DepartmentRowProps {
  department: {
    id:     string;
    name:   string;
    _count: { users: number };
  };
  canDelete:  boolean;
  onDeleted:  (id: string) => void;
}

/**
 * DESIGN.md: minimal text row — no heavy chrome.
 * Icon monochrome, delete button restrained (only visible on hover).
 * Confirmation inline — no separate modal for a row-level delete.
 */
export default function DepartmentRow({
  department,
  canDelete,
  onDeleted,
}: DepartmentRowProps) {
  const { success, error: toastError } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading]             = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/departments?id=${department.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete department.");
      success(`"${department.name}" has been removed.`);
      onDeleted(department.id);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to delete.");
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group flex items-center gap-3 px-4 py-3 border-b border-tertiary last:border-b-0 hover:bg-surface/50 transition-colors">
      {/* Icon */}
      <div className="w-7 h-7 rounded-md bg-surface border border-tertiary flex items-center justify-center shrink-0">
        <Building2 size={13} className="text-secondary" />
      </div>

      {/* Name */}
      <span className="flex-1 text-[14px] font-medium text-on-surface truncate">
        {department.name}
      </span>

      {/* User count badge */}
      <span className="shrink-0 flex items-center gap-1 text-[12px] text-secondary">
        <Users size={12} />
        {department._count.users}
      </span>

      {/* Delete — SYS_ADMIN only, hidden unless hovered or confirming */}
      {canDelete && department._count.users === 0 && (
        <>
          {confirmDelete ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[12px] text-secondary">Delete?</span>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-[12px] font-medium text-error hover:opacity-75 transition-opacity disabled:opacity-40"
              >
                {loading ? "…" : "Yes"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[12px] text-secondary hover:text-on-surface transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label={`Delete ${department.name}`}
              className="shrink-0 p-1 rounded text-secondary opacity-0 group-hover:opacity-100 hover:text-error transition-all"
            >
              <Trash2 size={13} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
