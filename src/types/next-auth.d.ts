// src/types/next-auth.d.ts

import type { Role } from "./user";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id:           string;
      name:         string;
      email:        string;
      role:         Role;
      departmentId: string;
    };
  }

  interface User {
    id?:          string;
    name?:        string | null;
    email?:       string | null;
    role:         Role;
    departmentId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:           string;
    role:         Role;
    name:         string;
    email:        string;
    departmentId: string;
    checkedAt?:   number;
  }
}
