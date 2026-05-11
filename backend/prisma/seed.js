import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 جاري تشغيل الـ seed...')

  // Admin
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@ssaas.com' },
    update: {},
    create: {
      email:    'admin@ssaas.com',
      password: adminPassword,
      fullName: 'مسؤول النظام',
      role:     'ADMIN',
      isActive: true,
    },
  })

  // خدمات تجريبية
  const services = [
    { name: 'Finance',             nameAr: 'المالية',               category: 'FINANCE' },
    { name: 'Accounting',          nameAr: 'المحاسبة والتقارير',    category: 'ACCOUNTING' },
    { name: 'HR Services',         nameAr: 'الموارد البشرية',       category: 'HR' },
    { name: 'Government Relations',nameAr: 'العلاقات الحكومية',     category: 'GOVERNMENT_RELATIONS' },
    { name: 'Legal Services',      nameAr: 'الخدمات القانونية',     category: 'LEGAL' },
    { name: 'Procurement',         nameAr: 'المشتريات',             category: 'PROCUREMENT' },
    { name: 'Marketing',           nameAr: 'التسويق',               category: 'MARKETING' },
    { name: 'Business Development',nameAr: 'تطوير الأعمال',         category: 'BUSINESS_DEVELOPMENT' },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where:  { id: s.name },
      update: {},
      create: s,
    })
  }

  console.log('✅ Seed اكتمل بنجاح')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
