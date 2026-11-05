import { createHash, randomBytes } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { config } from "dotenv"
import { PrismaClient, type City } from "@prisma/client"

config({ override: true })
process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL

const prisma = new PrismaClient()

const NOT_SUPPLIED = "Not supplied"

const categoryTags: Record<string, string> = {
  Restaurant: "restaurant",
  Bakery: "bakery",
  Caterer: "caterer",
  "Lodges-Safaris-Tours": "lodges-safaris-tours",
  Supermarket: "supermarket",
  Deli: "deli",
  "Take Away": "take-away",
  Butchery: "butchery",
  "Coffee Shop": "coffee-shop",
  "Function Coordinator": "function-coordinator",
  "Fish Shop": "fish-shop",
  "Mobile Coffee Stall": "mobile-coffee-stall",
  "Mobile Pizza": "mobile-pizza",
  "Mobile Bars": "mobile-bars",
  "Mobile ice cream bar": "mobile-ice-cream-bar",
  "Old Age Home": "old-age-home",
  Abattoir: "abattoir",
  "Mobile Sweet Bar": "mobile-sweet-bar",
  "Mobile Food Truck": "mobile-food-truck",
  "Mobile Braai": "mobile-braai",
  "Crockery/Cutlery Hire": "crockery-cutlery-hire",
  "Green Grocer": "green-grocer",
  "Ice Cream shop": "ice-cream-shop",
  "Liquor Store": "liquor-store",
  "Hospital meals": "hospital-meals",
  "Wedding Venues": "wedding-venues",
}

const cityBySource: Record<string, City> = {
  Johannesburg: "JOHANNESBURG",
  "Cape Town": "CAPE_TOWN",
  Other: "OTHER",
}

type SourcePhone = { disp: string; tel: string; label: string; wa: boolean }
type SourceListing = {
  name: string
  cats: string[]
  city: string
  place: string
  address: string
  phones: SourcePhone[]
  emails: string[]
  webs: string[]
  ig: string
  fb: string
  k: { p: boolean; d: boolean; c: boolean; m: boolean; h: boolean }
  notes: string
  post: string
}

function marker(post: string) {
  return `KosherSA post ${post}.`
}

function cleanNotes(notes: string) {
  return notes
    .split("|")
    .map((part) => part.trim().replace(/^\((.*)\)$/, "$1").trim())
    .filter(Boolean)
    .join(" | ")
}

function httpUrl(value: string) {
  const trimmed = value.trim()
  return /^https?:\/\/\S+$/i.test(trimmed) ? trimmed : undefined
}

function postalCode(address: string) {
  const matches = address.match(/\b(\d{4})\b/g)
  return matches?.at(-1)
}

function streetLine(address: string, suburb: string, postal?: string) {
  let line = address.trim()
  if (!line) return undefined
  if (postal) line = line.replace(new RegExp(`,?\\s*${postal}\\s*$`), "").replace(/,\s*$/, "").trim()
  if (!line || line.toLowerCase() === suburb.toLowerCase()) return undefined
  return line
}

function descriptionOf(listing: SourceListing, primary: SourcePhone | undefined, website?: string) {
  const parts = [cleanNotes(listing.notes)]
  const extraPhones = listing.phones.filter((phone) => phone !== primary)
  if (extraPhones.length) {
    parts.push(extraPhones.map((phone) => (phone.wa ? `WhatsApp ${phone.disp}` : phone.disp)).join(", "))
  }
  const extraEmails = listing.emails.slice(1)
  if (extraEmails.length) parts.push(extraEmails.join(", "))
  if (listing.fb && listing.fb !== website) parts.push(listing.fb)
  if (listing.ig && listing.ig !== website) parts.push(listing.ig)
  const text = parts.filter(Boolean).join(" | ")
  return text || undefined
}

async function main() {
  const sourcePath = path.resolve(__dirname, "../../app/src/main/assets/listings.json")
  const listings = JSON.parse(readFileSync(sourcePath, "utf8")) as SourceListing[]
  const industry = await prisma.industry.findUnique({
    where: { slug: "food-hospitality" },
    include: { tags: true },
  })
  if (!industry) throw new Error("Missing the food-hospitality industry. Seed the database first.")
  const tagsBySlug = new Map(industry.tags.map((tag) => [tag.slug, tag.id]))

  let created = 0
  let skipped = 0

  for (const listing of listings) {
    const note = marker(listing.post)
    const existing = await prisma.business.findFirst({
      where: { reviewerNotes: { contains: note } },
      select: { refCode: true },
    })
    if (existing) {
      skipped += 1
      console.log(`skip ${existing.refCode} ${listing.name}`)
      continue
    }

    const city = cityBySource[listing.city]
    if (!city) throw new Error(`Unknown city "${listing.city}" for ${listing.name}`)
    const tagIds = listing.cats.map((category) => {
      const slug = categoryTags[category]
      const tagId = slug ? tagsBySlug.get(slug) : undefined
      if (!tagId) throw new Error(`Unknown category "${category}" for ${listing.name}`)
      return tagId
    })

    const suburb = listing.place && listing.place !== "No address listed" ? listing.place : "Not listed"
    const postal = postalCode(listing.address || "")
    const primary = listing.phones.find((phone) => !phone.wa) ?? listing.phones[0]
    const website = listing.webs.map(httpUrl).find(Boolean) ?? httpUrl(listing.fb) ?? httpUrl(listing.ig)
    const email = listing.emails[0]?.trim().toLowerCase()

    const business = await prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear()
      const rows = await tx.$queryRaw<{ lastValue: number }[]>`
        INSERT INTO "RefSequence" ("year", "lastValue")
        VALUES (${year}, 1)
        ON CONFLICT ("year") DO UPDATE
        SET "lastValue" = "RefSequence"."lastValue" + 1
        RETURNING "lastValue"
      `
      const sequence = rows[0]?.lastValue ?? 1
      const refCode = `JBD-${year}-${String(sequence).padStart(4, "0")}`
      return tx.business.create({
        data: {
          refCode,
          legalName: listing.name,
          registrationType: "SOLE_PROPRIETOR",
          proofOfAddressKey: `import/koshersa/${listing.post}/address`,
          businessModel: "B2C",
          operationalFormat: "PHYSICAL",
          websiteUrl: website,
          contactName: listing.name,
          contactPhone: primary?.tel?.trim() || primary?.disp?.trim() || NOT_SUPPLIED,
          contactEmail: email && email.includes("@") ? email : NOT_SUPPLIED,
          industryId: industry.id,
          customDescription: descriptionOf(listing, primary, website),
          jewishOwnershipPercentage: 0,
          synagogueOtherName: "Not recorded in the KosherSA list",
          rabbiContactName: NOT_SUPPLIED,
          rabbiContactPhone: NOT_SUPPLIED,
          jewishProofDocKey: `import/koshersa/${listing.post}/jewish-proof`,
          offersDiscount: false,
          status: "APPROVED",
          isTest: false,
          approvedAt: new Date(),
          reviewerNotes: `${note} Imported from the KosherSA shopping and dining spreadsheet. Registration, ownership, rabbi, and Beth Din certificate number were not in that file.`,
          consentAccepted: true,
          accuracyDeclared: true,
          statusTokenHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
          locations: {
            create: {
              addressLine1: streetLine(listing.address || "", suburb, postal),
              suburb,
              city,
              postalCode: postal,
              isPrimary: true,
            },
          },
          tags: { create: tagIds.map((tagId) => ({ tagId })) },
          kosherCertification: {
            create: {
              brandName: listing.name,
              bethDinCertNumber: NOT_SUPPLIED,
              certDocKey: `import/koshersa/${listing.post}/beth-din`,
              allowsBulkOrdering: false,
              parev: listing.k.p,
              dairy: listing.k.d,
              chalavYisrael: listing.k.c,
              meat: listing.k.m,
              mehadrin: listing.k.h,
            },
          },
        },
        select: { refCode: true },
      })
    })

    created += 1
    console.log(`${business.refCode} ${listing.name}`)
  }

  const approved = await prisma.business.count({ where: { status: "APPROVED", isTest: false, reviewerNotes: { contains: "KosherSA post " } } })
  console.log(`created ${created}, skipped ${skipped}, kosherSA approved ${approved}`)
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
