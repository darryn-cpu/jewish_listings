import { config } from "dotenv"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { industries, synagogues } from "./taxonomy"

config()

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_SEED_PASSWORD
  if (!email || !password || password.length < 10) {
    throw new Error("Set ADMIN_SEED_EMAIL and an ADMIN_SEED_PASSWORD of at least 10 characters before seeding.")
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      role: "SUPERADMIN",
      isActive: true,
    },
  })

  for (const industry of industries) {
    const saved = await prisma.industry.upsert({
      where: { slug: industry.slug },
      update: { name: industry.name, sortOrder: industry.sortOrder },
      create: { slug: industry.slug, name: industry.name, sortOrder: industry.sortOrder },
    })
    for (const serviceTag of industry.tags) {
      await prisma.serviceTag.upsert({
        where: { slug: serviceTag.slug },
        update: { name: serviceTag.name, industryId: saved.id },
        create: { slug: serviceTag.slug, name: serviceTag.name, industryId: saved.id },
      })
    }
  }

  for (const synagogue of synagogues) {
    await prisma.synagogue.upsert({
      where: { name_city: { name: synagogue.name, city: synagogue.city } },
      update: {},
      create: { name: synagogue.name, city: synagogue.city },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
