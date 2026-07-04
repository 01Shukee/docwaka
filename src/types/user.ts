// src/types/user.ts

export type Role =
  | "SYS_ADMIN"
  | "HOD"
  | "DEAN"
  | "DEPT_ADMIN"
  | "STAFF";

export type AccountStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Department {
  id:   string;
  name: string;
}

export interface UserSummary {
  id:           string;
  name:         string;
  email:        string;
  role:         Role;
  status:       AccountStatus;
  department:   Department;
  approvedById: string | null;
  approvedBy:   { id: string; name: string } | null;
  createdAt:    string;
}

export interface UserProfile extends UserSummary {
  _count: {
    sentDocuments:     number;
    receivedDocuments: number;
  };
}

// Human-readable role labels for display in the UI
export const ROLE_LABELS: Record<Role, string> = {
  SYS_ADMIN:  "System Administrator",
  HOD:        "Head of Department",
  DEAN:       "Dean",
  DEPT_ADMIN: "Department Administrator",
  STAFF:      "Staff",
};

// Roles available in the public registration form (SYS_ADMIN excluded per FSD §4.1)
export const REGISTERABLE_ROLES: Role[] = ["HOD", "DEAN", "DEPT_ADMIN", "STAFF"];

// Roles that have access to the Admin panel (FSD §6.3)
export const ADMIN_ROLES: Role[] = ["DEPT_ADMIN", "HOD", "DEAN", "SYS_ADMIN"];

/**
 * Returns which roles a given approver role is permitted to approve.
 * FSD §3.1 — five-tier role hierarchy.
 */
export function getApprovableRoles(approverRole: Role): Role[] {
  switch (approverRole) {
    case "SYS_ADMIN":
      return ["HOD", "DEAN"];
    case "HOD":
    case "DEAN":
      return ["DEPT_ADMIN"];
    case "DEPT_ADMIN":
      return ["STAFF"];
    default:
      return [];
  }
}
