// src/types/next-auth.d.ts

import type { Role } from "./user";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id:    string;
      name:  string;
      email: string;
      role:  Role;
    };
  }

  interface User {
    id:    string;
    name:  string;
    email: string;
    role:  Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:    string;
    role:  Role;
    name:  string;
    email: string;
  }
}
