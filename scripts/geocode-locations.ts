import { config } from "dotenv"
import { PrismaClient, type City } from "@prisma/client"
import { chooseHit, geocodeQueries, type GeoHit } from "../src/lib/placeGeocode"

config({ override: true })
process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL

const prisma = new PrismaClient()
const USER_AGENT = "JewishYellowPages/1.0 (shopping and dining directory geocoder)"

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function search(query: string, attempt = 0): Promise<GeoHit[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("limit", "5")
  url.searchParams.set("countrycodes", "za")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("q", query)
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  })
  if (response.status === 429 && attempt < 3) {
    await sleep(5000)
    return search(query, attempt + 1)
  }
  if (!response.ok) return []
  const body = (await response.json()) as GeoHit[]
  return Array.isArray(body) ? body : []
}

async function main() {
  const rows = await prisma.businessLocation.findMany({
    where: { business: { reviewerNotes: { contains: "KosherSA post " } } },
    select: {
      id: true,
      addressLine1: true,
      suburb: true,
      city: true,
      postalCode: true,
      latitude: true,
      longitude: true,
      business: { select: { legalName: true } },
    },
    orderBy: { id: "asc" },
  })

  let updated = 0
  let kept = 0
  let cleared = 0
  let skipped = 0
  let missed = 0

  for (const row of rows) {
    const place = {
      addressLine1: row.addressLine1,
      suburb: row.suburb,
      city: row.city as City,
      postalCode: row.postalCode,
    }
    const queries = geocodeQueries(place)
    if (!queries.length) {
      skipped += 1
      console.log(`skip ${row.business.legalName}`)
      continue
    }

    let point: { lat: number; lng: number } | null = null
    let answered = false
    for (const query of queries) {
      try {
        const hits = await search(query)
        answered = true
        point = chooseHit(hits, place)
      } catch (error) {
        console.log(`error ${row.business.legalName} | ${error instanceof Error ? error.message : "request failed"}`)
      }
      await sleep(1100)
      if (point) break
    }

    const currentLat = row.latitude == null ? null : Number(row.latitude.toString())
    const currentLng = row.longitude == null ? null : Number(row.longitude.toString())
    const same = point != null && currentLat != null && currentLng != null
      && Math.abs(currentLat - point.lat) < 0.0002
      && Math.abs(currentLng - point.lng) < 0.0002

    if (same) {
      kept += 1
      console.log(`keep ${row.business.legalName}`)
      continue
    }
    if (point) {
      await prisma.businessLocation.update({
        where: { id: row.id },
        data: { latitude: point.lat, longitude: point.lng },
      })
      updated += 1
      console.log(`pin ${row.business.legalName} ${point.lat},${point.lng}`)
      continue
    }
    if (answered && currentLat != null) {
      await prisma.businessLocation.update({
        where: { id: row.id },
        data: { latitude: null, longitude: null },
      })
      cleared += 1
      console.log(`clear ${row.business.legalName}`)
      continue
    }
    missed += 1
    console.log(`miss ${row.business.legalName} | ${queries[0]}`)
  }

  console.log(`updated ${updated}, kept ${kept}, cleared ${cleared}, skipped ${skipped}, missed ${missed}`)
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
