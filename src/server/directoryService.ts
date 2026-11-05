import "server-only"
import { Prisma, type Prisma as PrismaTypes } from "@prisma/client"
import { prisma } from "@/server/prisma"
import { nearestDistanceKm, toPublicDetail, toPublicListItem, type PublicSource } from "@/server/publicDto"
import { directoryWhere, publicListingFilter, type DirectoryQuery } from "@/server/schemas"

const publicInclude = {
  industry: { select: { slug: true, name: true } },
  tags: { include: { tag: { select: { slug: true, name: true } } } },
  locations: { orderBy: { isPrimary: "desc" } },
  kosherCertification: true,
} satisfies PrismaTypes.BusinessInclude

async function withTestFlags<T extends { id: string }>(rows: T[]) {
  if (!rows.length) return rows
  const flags = await prisma.$queryRaw<Array<{ id: string; isTest: boolean }>>(
    Prisma.sql`SELECT id, "isTest" FROM "Business" WHERE id IN (${Prisma.join(rows.map((row) => row.id))})`,
  )
  const flagged = new Map(flags.map((row) => [row.id, row.isTest]))
  return rows.map((row) => ({ ...row, isTest: flagged.get(row.id) === true }))
}

export async function listDirectory(query: DirectoryQuery) {
  const where = directoryWhere(query)
  if (query.lat != null && query.lng != null) {
    const rows = await withTestFlags(await prisma.business.findMany({ where, include: publicInclude }))
    const ranked = rows
      .map((row) => {
        const distanceKm = nearestDistanceKm(row.locations, query.lat, query.lng)
        return { row, distanceKm }
      })
      .filter((entry) => {
        if (query.radiusKm == null) return entry.distanceKm != null
        return entry.distanceKm != null && entry.distanceKm <= query.radiusKm
      })
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    const start = (query.page - 1) * query.limit
    return {
      page: query.page,
      limit: query.limit,
      total: ranked.length,
      results: ranked.slice(start, start + query.limit).map((entry) => toPublicListItem(entry.row as PublicSource, entry.distanceKm)),
    }
  }

  const [total, rows] = await Promise.all([
    prisma.business.count({ where }),
    withTestFlags(await prisma.business.findMany({
      where,
      include: publicInclude,
      orderBy: { legalName: "asc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    })),
  ])
  return {
    page: query.page,
    limit: query.limit,
    total,
    results: rows.map((row) => toPublicListItem(row as PublicSource)),
  }
}

export async function getApprovedBusiness(id: string) {
  const row = await prisma.business.findFirst({
    where: { id, ...publicListingFilter },
    include: publicInclude,
  })
  if (!row) return null
  const [flagged] = await withTestFlags([row])
  return toPublicDetail(flagged as PublicSource)
}
