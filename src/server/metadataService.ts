import "server-only"
import { readCache, writeCache } from "@/server/cache"
import { CITY_LABEL } from "@/lib/labels"
import { prisma } from "@/server/prisma"

export async function getMetadata() {
  const cached = readCache("metadata", "all")
  if (cached) return cached as Awaited<ReturnType<typeof loadMetadata>>
  const metadata = await loadMetadata()
  writeCache("metadata", "all", metadata, 60 * 60 * 1000)
  return metadata
}

async function loadMetadata() {
  const [industries, synagogues] = await Promise.all([
    prisma.industry.findMany({
      orderBy: { sortOrder: "asc" },
      include: { tags: { orderBy: { name: "asc" } } },
    }),
    prisma.synagogue.findMany({ orderBy: [{ city: "asc" }, { name: "asc" }] }),
  ])
  return {
    cities: (Object.keys(CITY_LABEL) as (keyof typeof CITY_LABEL)[]).map((id) => ({ id, label: CITY_LABEL[id] })),
    industries: industries.map((industry) => ({
      id: industry.id,
      slug: industry.slug,
      name: industry.name,
      tags: industry.tags.map((tag) => ({ id: tag.id, slug: tag.slug, name: tag.name })),
    })),
    synagogues: synagogues.map((synagogue) => ({
      id: synagogue.id,
      name: synagogue.name,
      city: synagogue.city,
      rabbiName: synagogue.rabbiName,
    })),
  }
}
