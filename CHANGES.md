# DocWaka — bug-fix & efficiency pass

## Run after pulling these changes
1. `npm install`            (removes 7 unused packages)
2. `npx prisma db push`     (adds indexes + `@@unique([documentId, userId])` on signatures)
   - If it errors on the unique constraint, you have duplicate signatures; delete the older duplicates first.
3. Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before seeding a fresh DB.
4. `npm run typecheck && npm run build`  (not run in the authoring sandbox — no network)

## Security / correctness
- middleware.ts was at the repo root but the app lives in `src/`, so it never ran. Moved to `src/middleware.ts` using an edge-safe `auth.config.ts` (Prisma can't run on the edge). API calls now get JSON 401s.
- Revoked/rejected users kept access for 30 days (JWT never re-checked). Sessions are now re-validated against the DB every 5 min; role/name/department refresh too.
- Login: pending/rejected status was revealed before the password was checked; unknown emails returned faster than wrong passwords (timing). Both fixed. "Account pending/rejected" messages never displayed (v5 needs CredentialsSignin codes) — fixed.
- `fileUrl` accepted `javascript:` URLs → stored XSS via the "Open"/iframe. Now only validated data URLs (magic-byte checked) or UploadThing HTTPS hosts. Upload checks real file bytes, not the client-declared type.
- HOD/DEAN/DEPT_ADMIN could approve/reject/revoke users in ANY department (PATCH wasn't department-scoped). Fixed.
- Any DEPT_ADMIN could read every document system-wide; now scoped to their department (same as the audit log). SYS_ADMIN still sees all.
- Open redirect via `callbackUrl` on login. Fixed.
- Seed reset the admin password to a hard-coded value on every run and printed it. Now env-driven, never overwrites.

## Logic bugs
- Accept/reject/deliver/sign were check-then-write: double-clicks or accept-vs-reject races could both succeed and duplicate audit rows; audit failures were silently swallowed. Each is now ONE atomic conditional update (status + audit + rejection log together).
- Duplicate signatures possible → DB unique constraint + upsert; re-signing is now audited.
- Audit search 500'd on any term that wasn't an action name (e.g. "john"), and on non-numeric page/limit. Fixed.
- A REJECTED HOD/DEAN/DEPT_ADMIN registration permanently blocked that seat. Rejected accounts no longer count.
- Duplicate email / department name races returned 500; now 409.
- Attachments: base64 data URLs never matched the `.pdf` check (always "no preview") and Chrome blocks opening data: URLs. Files are now served by an authenticated `/api/documents/[id]/file` route.
- Preview vanished after accept/reject (state replaced without the file). Now merged.
- Global loader: every button click showed a full-screen overlay for up to 8 s (accept, reject, sign…); also stuck on ctrl-click / same-page links. Now only real navigation and form submits.
- Profile name change didn't update the session until re-login.
- Passwords > 72 chars were silently truncated by bcrypt; now capped.

## Efficiency
- List endpoints no longer load the `fileUrl` blob (up to ~21 MB/row) — the biggest win.
- DB indexes on every hot query path (inbox, outbox, audit, user admin).
- departmentId lives in the session: removed an extra DB query from audit + admin routes.
- Inbox derives the pending badge from the list (one fewer query); register runs lookups in parallel; seed uses one `createMany`.
- Removed unused deps: framer-motion, react-signature-canvas, pg, @auth/prisma-adapter, @uploadthing/react (+ their @types).

## Not changed (recommend next)
- Move attachments out of Postgres into object storage (UploadThing is already wired up server-side).
- Rate-limit /login and /register (needs Redis/Upstash on serverless).
- HOD/DEAN/DEPT_ADMIN seat uniqueness is still check-then-insert; enforce with a partial unique index in SQL.
- Inbox/outbox lists are unpaginated; `next lint` has no ESLint config installed.

## Email notifications (new)
Real emails via SMTP (Nodemailer), sent after the API response so a slow/failed mail server never blocks or breaks the action.
- Document dispatched → email to the **recipient** with a "Review document" link.
- Accepted / rejected (with reason) / delivered → email to the **sender**.
- Account approved / rejected → email to that user.
- Setup: `npm install`, then fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` and `NEXT_PUBLIC_APP_URL` (used for the links) in `.env`. If SMTP isn't configured the app still works and just logs a warning.
- Files: `src/lib/email.ts`, `email-templates.ts`, `notifications.ts`.
