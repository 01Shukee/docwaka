// prisma/seed.ts

import { PrismaClient, Role, AccountStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const DEPARTMENTS: string[] = [
  "School of Engineering and Engineering Technology",
  "Department of Agricultural Engineering",
  "Department of Chemical Engineering",
  "Department of Civil Engineering",
  "Department of Computer Science",
  "Department of Electrical Engineering",
  "Department of Mechanical Engineering",
  "Department of Polymer and Textile Engineering",
  "Department of Biology",
  "Department of Chemistry",
  "Department of Geology",
  "Department of Mathematics",
  "Department of Physics",
  "Department of Statistics",
  "Department of Animal Science",
  "Department of Crop Science and Technology",
  "Department of Fisheries and Aquaculture",
  "Department of Food Science and Technology",
  "Department of Forestry and Wood Technology",
  "Department of Soil Science and Technology",
  "Department of Accountancy",
  "Department of Banking and Finance",
  "Department of Business Administration",
  "Department of Marketing",
  "Department of Public Administration",
  "Department of Architecture",
  "Department of Estate Management",
  "Department of Quantity Surveying",
  "Department of Urban and Regional Planning",
  "Department of Biomedical Technology",
  "Department of Environmental Health",
  "Department of Medical Laboratory Science",
  "Department of Nutrition and Dietetics",
  "Department of Optometry",
  "Department of Science Laboratory Technology",
  "Registry",
  "Bursary",
  "Library",
  "Student Affairs",
  "Academic Planning",
  "ICT Unit",
  "Works and Services",
];

async function main() {
  console.log("🌱  Seeding DocWaka database...\n");

  // ── 1. Upsert departments ONE AT A TIME to avoid connection pool exhaustion
  console.log(`📁  Seeding ${DEPARTMENTS.length} departments...`);

  const departmentRecords = [];
  for (const name of DEPARTMENTS) {
    const dept = await prisma.department.upsert({
      where:  { name },
      update: {},
      create: { name },
    });
    departmentRecords.push(dept);
    process.stdout.write(".");
  }
  console.log(`\n    ✓ ${departmentRecords.length} departments ready.\n`);

  // ── 2. Upsert SYS_ADMIN ─────────────────────────────────────────────────
  const adminDept = departmentRecords.find((d) => d.name === "Registry");
  if (!adminDept) throw new Error("Registry department not found.");

  const ADMIN_EMAIL    = "admin@docwaka.com";
  const ADMIN_PASSWORD = "Admin@1234";

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Self-verify before writing
  const selfCheck = await bcrypt.compare(ADMIN_PASSWORD, hashedPassword);
  if (!selfCheck) throw new Error("bcrypt self-check failed.");
  console.log("🔐  bcrypt self-check passed.");

  await prisma.user.upsert({
    where:  { email: ADMIN_EMAIL },
    update: {
      password: hashedPassword,
      status:   AccountStatus.APPROVED,
      role:     Role.SYS_ADMIN,
    },
    create: {
      name:         "System Administrator",
      email:        ADMIN_EMAIL,
      password:     hashedPassword,
      role:         Role.SYS_ADMIN,
      status:       AccountStatus.APPROVED,
      departmentId: adminDept.id,
    },
  });

  // ── 3. Verify hash round-trip from DB ────────────────────────────────────
  const stored = await prisma.user.findUnique({
    where:  { email: ADMIN_EMAIL },
    select: { password: true, status: true },
  });
  if (!stored) throw new Error("Admin not found after upsert.");

  const dbCheck = await bcrypt.compare(ADMIN_PASSWORD, stored.password);

  console.log(`\n👤  SYS_ADMIN account:`);
  console.log(`    Email:      ${ADMIN_EMAIL}`);
  console.log(`    Password:   ${ADMIN_PASSWORD}`);
  console.log(`    Status:     ${stored.status}`);
  console.log(`    Hash valid: ${dbCheck ? "✅ YES" : "❌ NO"}\n`);

  if (!dbCheck) throw new Error("Stored hash mismatch — login will fail.");

  console.log("✅  Done. Login with admin@docwaka.com / Admin@1234");
}

main()
  .catch((e) => {
    console.error("\n❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });