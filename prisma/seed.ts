// prisma/seed.ts
import { PrismaClient, Role, AccountStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Official FUTO Academic Structure (2024) ───────────────────────────────────
// Source: FUTO official website — 11 schools + SPGS + GST + Admin Units
const DEPARTMENTS: string[] = [

  // 1. School of Agriculture and Agricultural Technology (SAAT) — 8 depts
  "SAAT – Agribusiness",
  "SAAT – Agricultural Economics",
  "SAAT – Agricultural Extension",
  "SAAT – Animal Science and Technology",
  "SAAT – Crop Science and Technology",
  "SAAT – Fisheries and Aquaculture Technology",
  "SAAT – Forestry and Wildlife Technology",
  "SAAT – Soil Science and Technology",

  // 2. School of Basic Medical Sciences (SBMS) — 2 depts
  "SBMS – Human Anatomy",
  "SBMS – Human Physiology",

  // 3. School of Biological Sciences (SOBS) — 5 depts
  "SOBS – Biochemistry",
  "SOBS – Biology",
  "SOBS – Biotechnology",
  "SOBS – Forensic Science",
  "SOBS – Microbiology",

  // 4. School of Engineering and Engineering Technology (SEET) — 9 depts
  "SEET – Agricultural and Bioresources Engineering",
  "SEET – Biomedical Engineering",
  "SEET – Chemical Engineering",
  "SEET – Civil Engineering",
  "SEET – Food Science and Technology",
  "SEET – Materials and Metallurgical Engineering",
  "SEET – Mechanical Engineering",
  "SEET – Petroleum Engineering",
  "SEET – Polymer and Textile Engineering",

  // 5. School of Electrical Systems and Engineering Technology (SESET) — 6 depts
  "SESET – Computer Engineering",
  "SESET – Electrical and Electronic Engineering",
  "SESET – Electrical (Power Systems) Engineering",
  "SESET – Electronics Engineering",
  "SESET – Mechatronics Engineering",
  "SESET – Telecommunications Engineering",

  // 6. School of Environmental Sciences (SOES) — 7 depts
  "SOES – Architecture",
  "SOES – Building Technology",
  "SOES – Environmental Management",
  "SOES – Environmental Management and Evaluation",
  "SOES – Quantity Surveying",
  "SOES – Surveying and Geoinformatics",
  "SOES – Urban and Regional Planning",

  // 7. School of Health Technology (SOHT) — 5 depts
  "SOHT – Dental Technology",
  "SOHT – Environmental Health Science",
  "SOHT – Optometry",
  "SOHT – Prosthetics and Orthotics",
  "SOHT – Public Health Technology",

  // 8. School of Information and Communication Technology (SICT) — 4 depts
  "SICT – Computer Science",
  "SICT – Cyber Security",
  "SICT – Information Technology",
  "SICT – Software Engineering",

  // 9. School of Logistics and Innovation Technology (SLIT) — 5 depts
  "SLIT – Entrepreneurship and Innovation",
  "SLIT – Logistics and Transport Technology",
  "SLIT – Maritime Technology and Logistics",
  "SLIT – Project Management Technology",
  "SLIT – Supply Chain Management",

  // 10. School of Physical Sciences (SOPS) — 6 depts
  "SOPS – Chemistry",
  "SOPS – Geology",
  "SOPS – Mathematics",
  "SOPS – Physics",
  "SOPS – Science Laboratory Technology",
  "SOPS – Statistics",

  // 11. School of Postgraduate Studies (SPGS)
  "School of Postgraduate Studies (SPGS)",

  // Directorate of General Studies
  "Directorate of General Studies (GST)",

  // Administrative Units
  "Registry",
  "Bursary",
  "University Library",
  "Student Affairs Division",
  "Academic Planning Unit",
  "ICT Directorate",
  "Works and Physical Planning",
  "Legal Unit",
  "Directorate of Research, Innovation and Commercialisation",
  "University Health Services",
  "Sports Council",
  "Security Unit",
  "Vice-Chancellor's Office",
  "Council Secretariat",
];

async function main() {
  console.log("🌱  Seeding DocWaka database...\n");
  console.log(`📁  Seeding ${DEPARTMENTS.length} departments/units...`);

  const departmentRecords = [];
  for (const name of DEPARTMENTS) {
    const dept = await prisma.department.upsert({
      where: { name }, update: {}, create: { name },
    });
    departmentRecords.push(dept);
    process.stdout.write(".");
  }
  console.log(`\n    ✓ ${departmentRecords.length} entries ready.\n`);

  // ── SYS_ADMIN ─────────────────────────────────────────────────────────────
  const adminDept = departmentRecords.find(d => d.name === "Registry");
  if (!adminDept) throw new Error("Registry not found.");

  const ADMIN_EMAIL    = "admin@docwaka.com";
  const ADMIN_PASSWORD = "Admin@1234";
  const hash     = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const selfCheck = await bcrypt.compare(ADMIN_PASSWORD, hash);
  if (!selfCheck) throw new Error("bcrypt self-check failed.");

  await prisma.user.upsert({
    where:  { email: ADMIN_EMAIL },
    update: { password: hash, status: AccountStatus.APPROVED, role: Role.SYS_ADMIN },
    create: { name: "System Administrator", email: ADMIN_EMAIL, password: hash, role: Role.SYS_ADMIN, status: AccountStatus.APPROVED, departmentId: adminDept.id },
  });

  const stored = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL }, select: { password: true, status: true } });
  if (!stored) throw new Error("Admin not found after upsert.");

  const dbCheck = await bcrypt.compare(ADMIN_PASSWORD, stored.password);
  console.log(`👤  SYS_ADMIN:`);
  console.log(`    Email:    ${ADMIN_EMAIL}`);
  console.log(`    Password: ${ADMIN_PASSWORD}`);
  console.log(`    DB hash:  ${dbCheck ? "✅ VALID" : "❌ INVALID"}\n`);
  if (!dbCheck) throw new Error("Hash mismatch — login will fail.");

  // Summary
  const academic = DEPARTMENTS.filter(d => d.includes("–")).length;
  const admin    = DEPARTMENTS.filter(d => !d.includes("–") && !d.includes("SPGS") && !d.includes("GST")).length;
  console.log(`✅  Done.`);
  console.log(`    ${academic} academic departments across 11 schools`);
  console.log(`    ${admin} administrative units`);
  console.log(`    ${departmentRecords.length} total entries`);
}

main()
  .catch(e => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });