import "server-only"
import { DINING_SLUGS, toDiningListing, type DiningSource } from "@/lib/diningListing"
import { prisma } from "@/server/prisma"

const diningInclude = {
  tags: { include: { tag: { select: { slug: true } } } },
  locations: { orderBy: { isPrimary: "desc" as const } },
  kosherCertification: {
    select: {
      meat: true,
      dairy: true,
      chalavYisrael: true,
      parev: true,
      mehadrin: true,
    },
  },
}

export async function listDiningCatalog() {
  const rows = await prisma.business.findMany({
    where: {
      status: "APPROVED",
      tags: { some: { tag: { slug: { in: [...DINING_SLUGS] } } } },
    },
    include: diningInclude,
    orderBy: { createdAt: "asc" },
  })
  const listings = []
  for (const row of rows) {
    const listing = toDiningListing(row as DiningSource, listings.length)
    if (listing) listings.push(listing)
  }
  return listings
}

export async function isPublishedDiningListing(id: string) {
  const row = await prisma.business.findFirst({
    where: {
      id,
      status: "APPROVED",
      tags: { some: { tag: { slug: { in: [...DINING_SLUGS] } } } },
    },
    select: { id: true },
  })
  return row != null
}
