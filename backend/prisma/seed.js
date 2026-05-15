import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 جاري تشغيل الـ seed...");

  // ─── Users ───────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const leaderPassword = await bcrypt.hash("Leader@123", 12);
  const clientPassword = await bcrypt.hash("Client@123", 12);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@ssaas.com" },
    update: {},
    create: {
      email: "admin@ssaas.com",
      password: adminPassword,
      fullName: "مسؤول النظام",
      role: "ADMIN",
      isActive: true,
    },
  });

  // Service Leader
  const leader = await prisma.user.upsert({
    where: { email: "leader@ssaas.com" },
    update: {},
    create: {
      email: "leader@ssaas.com",
      password: leaderPassword,
      fullName: "مسؤول الخدمة",
      role: "SERVICE_LEADER",
      isActive: true,
    },
  });

  await prisma.serviceLeaderProfile.upsert({
    where: { userId: leader.id },
    update: {},
    create: {
      userId: leader.id,
      department: "FINANCE",
      maxCapacity: 10,
    },
  });

  // Client
  const client = await prisma.user.upsert({
    where: { email: "client@ssaas.com" },
    update: {},
    create: {
      email: "client@ssaas.com",
      password: clientPassword,
      fullName: "العميل التجريبي",
      role: "CLIENT",
      isActive: true,
    },
  });

  await prisma.clientProfile.upsert({
    where: { userId: client.id },
    update: {},
    create: {
      userId: client.id,
      companyName: "شركة الاختبار",
      industry: "تقنية المعلومات",
    },
  });

  // ─── Services ────────────────────────────────────────────
  const services = [
    { name: "Finance", nameAr: "المالية", category: "FINANCE" },
    {
      name: "Accounting",
      nameAr: "المحاسبة والتقارير",
      category: "ACCOUNTING",
    },
    { name: "HR Services", nameAr: "الموارد البشرية", category: "HR" },
    {
      name: "Government Relations",
      nameAr: "العلاقات الحكومية",
      category: "GOVERNMENT_RELATIONS",
    },
    { name: "Legal Services", nameAr: "الخدمات القانونية", category: "LEGAL" },
    { name: "Procurement", nameAr: "المشتريات", category: "PROCUREMENT" },
    { name: "Marketing", nameAr: "التسويق", category: "MARKETING" },
    {
      name: "Business Development",
      nameAr: "تطوير الأعمال",
      category: "BUSINESS_DEVELOPMENT",
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.name },
      update: {},
      create: s,
    });
  }

  console.log("✅ Seed اكتمل بنجاح");
  console.log("");
  console.log("📋 بيانات الدخول للاختبار:");
  console.log("  ADMIN:          admin@ssaas.com   / Admin@123");
  console.log("  SERVICE_LEADER: leader@ssaas.com  / Leader@123");
  console.log("  CLIENT:         client@ssaas.com  / Client@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
