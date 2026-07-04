# DocWaka — Document Workflow & Tracking System

Federal University of Technology Owerri (FUTO) internal document routing and tracking platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | NextAuth v5 — JWT, Credentials provider |
| File storage | UploadThing (PDF / image) |
| Styling | Tailwind CSS — Mobbin Minimal design system |
| Validation | Zod |

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url> docwaka
cd docwaka
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# PostgreSQL connection string (Railway, Neon, Supabase, or local)
DATABASE_URL="postgresql://user:password@host:5432/docwaka?sslmode=require"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-32-char-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# UploadThing (https://uploadthing.com)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
# Push schema to your database
npm run db:push

# Seed: creates 43 FUTO departments + SYS_ADMIN account
npm run db:seed
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| System Administrator | `admin@docwaka.com` | `Admin@1234` |

All other accounts are created via `/register` and require approval before login.

---

## Role Hierarchy & Permissions

```
SYS_ADMIN
  └─ Approves:  HOD, DEAN
  └─ Sees:      All audit logs, all departments, all users system-wide

HOD / DEAN
  └─ Approves:  DEPT_ADMIN (in their department)
  └─ Sees:      Department-scoped audit logs

DEPT_ADMIN
  └─ Approves:  STAFF (in their department)
  └─ Sees:      Department-scoped audit logs

STAFF
  └─ No approval rights
  └─ Sees:      Their own document audit events only
```

---

## Document State Machine

```
[Created] → PENDING → ACCEPTED → DELIVERED
                ↓
            REJECTED
```

- **PENDING** → recipient must sign, then accept or reject
- **ACCEPTED** → recipient confirms physical delivery
- **DELIVERED** → terminal state
- **REJECTED** → terminal state (rejection reason required)

---

## Project Structure

```
docwaka/
├── prisma/
│   ├── schema.prisma        # 7 models, 4 enums
│   └── seed.ts              # 43 FUTO departments + SYS_ADMIN
├── src/
│   ├── lib/                 # Prisma, Auth, bcrypt, audit, UploadThing, Zod
│   ├── types/               # TypeScript types for user, document, next-auth
│   ├── hooks/               # SWR data hooks (useInbox, useDocument, etc.)
│   ├── components/
│   │   ├── ui/              # Button, Card, Input, Modal, Toast, Spinner...
│   │   ├── layout/          # Sidebar, AppShell, SidebarLink, SessionWrapper
│   │   ├── documents/       # DocumentCard, ActionCard, SignaturePad, AuditTrail...
│   │   └── admin/           # UserCard, DepartmentRow
│   └── app/
│       ├── api/             # 13 API route handlers
│       ├── (auth)/          # /login, /register
│       └── (dashboard)/     # /dashboard, /documents, /audit, /admin, /profile
├── middleware.ts            # Edge route protection
└── tailwind.config.ts       # Mobbin Minimal design tokens
```

---

## Design System

Mobbin Minimal — key tokens:

| Token | Value |
|---|---|
| Primary | `#141414` |
| Secondary | `#707070` |
| Surface | `#F7F7F7` |
| Tertiary (border) | `#E5E7EB` |
| Error | `#D92D20` |
| Font | Saans → DM Sans fallback |
| Button radius | `9999px` (pill) |
| Card radius | `8px` |
| Button height | `44px` |
| Input height | `40px` |

---

## Deployment

```bash
# Production build
npm run build
npm start
```

Recommended platforms: **Vercel** (Next.js) + **Railway** or **Neon** (PostgreSQL).

Set all `.env.local` variables as environment variables in your deployment platform.
