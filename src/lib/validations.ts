// src/lib/validations.ts

import { z } from "zod";
import { isAllowedFileUrl, MAX_FILE_URL_LENGTH } from "@/lib/files";

// bcrypt silently ignores everything after 72 bytes, so cap it explicitly.
const passwordRule = (label: string) => z
  .string()
  .min(8,  `${label} must be at least 8 characters.`)
  .max(72, `${label} must be at most 72 characters.`)
  .regex(/[A-Z]/,  `${label} must contain at least one uppercase letter.`)
  .regex(/[0-9]/,  `${label} must contain at least one number.`)
  .regex(/[^A-Za-z0-9]/, `${label} must contain at least one special character.`);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  name:         z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email:        z.string().trim().toLowerCase().email("Enter a valid email address."),
  password:     passwordRule("Password"),
  role:         z.enum(["HOD", "DEAN", "DEPT_ADMIN", "STAFF"], {
    errorMap: () => ({ message: "Select a valid role." }),
  }),
  departmentId: z.string().cuid("Select a valid department."),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ── Documents ─────────────────────────────────────────────────────────────────

export const createDocumentSchema = z.object({
  title:       z.string().trim().min(1, "Title is required.").max(200, "Title is too long."),
  description: z.string().max(2000, "Description is too long.").optional(),
  recipientId: z.string().cuid("Select a valid recipient."),
  fileUrl:     z
    .string()
    .max(MAX_FILE_URL_LENGTH, "File is too large.")
    .refine(isAllowedFileUrl, "Invalid or unsupported file.")
    .optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const documentActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("ACCEPT"),
  }),
  z.object({
    action: z.literal("REJECT"),
    reason: z.string().min(10, "Please provide a reason of at least 10 characters.").max(1000),
  }),
  z.object({
    action: z.literal("DELIVER"),
  }),
]);

export type DocumentActionInput = z.infer<typeof documentActionSchema>;

export const signatureSchema = z.object({
  data: z
    .string()
    .min(1, "Signature data is required.")
    .max(500_000, "Signature image is too large.")
    .regex(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/, "Signature must be a valid base64 image."),
});

export type SignatureInput = z.infer<typeof signatureSchema>;

// ── Admin ─────────────────────────────────────────────────────────────────────

export const userActionSchema = z.object({
  userId: z.string().cuid("Invalid user ID."),
  action: z.enum(["APPROVE", "REJECT", "REVOKE"], {
    errorMap: () => ({ message: "Invalid action." }),
  }),
});

export type UserActionInput = z.infer<typeof userActionSchema>;

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Department name must be at least 2 characters.").max(150),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

// ── Profile ───────────────────────────────────────────────────────────────────

export const updateNameSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword:     passwordRule("New password"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
