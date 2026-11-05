import { createHash, randomBytes, randomUUID } from "node:crypto"
import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { PrismaClient, type DocumentPurpose } from "@prisma/client"

config()

const prisma = new PrismaClient()

type DocSpec = {
  purpose: DocumentPurpose
  title: string
  lines: string[]
}

type ListingSpec = {
  legalName: string
  tradingName: string
  registrationType: "CIPC_REGISTERED_COMPANY" | "SOLE_PROPRIETOR" | "PARTNERSHIP" | "TRUST"
  cipcNumber?: string
  businessModel: "B2B" | "B2C" | "BOTH"
  operationalFormat: "PHYSICAL" | "ONLINE" | "HYBRID"
  websiteUrl: string
  contactName: string
  contactPhone: string
  contactEmail: string
  industrySlug: string
  tagSlugs: string[]
  customDescription: string
  jewishOwnershipPercentage: number
  synagogueName: string
  rabbiContactName: string
  rabbiContactPhone: string
  offersDiscount: boolean
  discountDetails?: string
  location: {
    branchName: string
    addressLine1: string
    suburb: string
    city: "JOHANNESBURG" | "CAPE_TOWN"
    postalCode: string
    latitude: number
    longitude: number
  }
  kosher?: {
    brandName: string
    bethDinCertNumber: string
    allowsBulkOrdering: boolean
    meat: boolean
    dairy: boolean
    chalavYisrael: boolean
    parev: boolean
    mehadrin: boolean
  }
  documents: DocSpec[]
}

const listings: ListingSpec[] = [
  {
    legalName: "Goldsteins Kosher Deli Proprietary Limited",
    tradingName: "Goldstein's Kosher Deli",
    registrationType: "CIPC_REGISTERED_COMPANY",
    cipcNumber: "2018/214563/07",
    businessModel: "B2C",
    operationalFormat: "PHYSICAL",
    websiteUrl: "https://goldsteins-deli.example.com",
    contactName: "David Goldstein",
    contactPhone: "+27118823410",
    contactEmail: "david.goldstein@example.com",
    industrySlug: "food-hospitality",
    tagSlugs: ["deli", "take-away"],
    customDescription: "Family deli in Glenhazel selling Beth Din supervised meats, salads, and weekly Shabbos packs.",
    jewishOwnershipPercentage: 100,
    synagogueName: "Linksfield Senderwood Hebrew Congregation",
    rabbiContactName: "Rabbi Yossi Levy",
    rabbiContactPhone: "+27116401982",
    offersDiscount: true,
    discountDetails: "10 percent off prepaid Shabbos orders for congregation members, placed by Thursday at noon.",
    location: {
      branchName: "Glenhazel",
      addressLine1: "42 Long Avenue",
      suburb: "Glenhazel",
      city: "JOHANNESBURG",
      postalCode: "2192",
      latitude: -26.1512,
      longitude: 28.1024,
    },
    kosher: {
      brandName: "Goldstein's",
      bethDinCertNumber: "UOS-BD-2018-441",
      allowsBulkOrdering: true,
      meat: true,
      dairy: false,
      chalavYisrael: false,
      parev: true,
      mehadrin: false,
    },
    documents: [
      {
        purpose: "CIPC",
        title: "CIPC registration",
        lines: [
          "CIPC registration certificate",
          "Goldsteins Kosher Deli Proprietary Limited",
          "Registration 2018/214563/07",
          "Issued for directory vetting. Test document only.",
        ],
      },
      {
        purpose: "ADDRESS",
        title: "Proof of address",
        lines: [
          "Municipal account",
          "Goldsteins Kosher Deli Proprietary Limited",
          "42 Long Avenue, Glenhazel, Johannesburg, 2192",
          "Account in the name of the business. Test document only.",
        ],
      },
      {
        purpose: "JEWISH_PROOF",
        title: "Rabbinical verification",
        lines: [
          "Rabbinical verification letter",
          "I confirm David Goldstein is a member of our congregation.",
          "Rabbi Yossi Levy",
          "Linksfield Senderwood Hebrew Congregation. Test document only.",
        ],
      },
      {
        purpose: "BETH_DIN",
        title: "Beth Din certificate",
        lines: [
          "Beth Din kosher certificate",
          "Brand: Goldstein's",
          "Certificate UOS-BD-2018-441",
          "Meat and parev. Bulk orders allowed. Test document only.",
        ],
      },
    ],
  },
  {
    legalName: "Rivka Levy",
    tradingName: "Levy Home Bakery",
    registrationType: "SOLE_PROPRIETOR",
    businessModel: "B2C",
    operationalFormat: "HYBRID",
    websiteUrl: "https://levy-bakery.example.com",
    contactName: "Rivka Levy",
    contactPhone: "+27214339821",
    contactEmail: "rivka.levy@example.com",
    industrySlug: "food-hospitality",
    tagSlugs: ["bakery", "caterer"],
    customDescription: "Chalav Yisrael cakes, challah, and dairy platters baked in Sea Point for Shabbos and simchas.",
    jewishOwnershipPercentage: 100,
    synagogueName: "Sea Point Hebrew Congregation",
    rabbiContactName: "Rabbi Shlomo Katz",
    rabbiContactPhone: "+27214391270",
    offersDiscount: true,
    discountDetails: "A free challah with every simcha cake ordered by a Sea Point congregation member.",
    location: {
      branchName: "Sea Point kitchen",
      addressLine1: "18 Regent Road",
      suburb: "Sea Point",
      city: "CAPE_TOWN",
      postalCode: "8005",
      latitude: -33.9168,
      longitude: 18.3872,
    },
    kosher: {
      brandName: "Levy Home Bakery",
      bethDinCertNumber: "CT-BD-2022-118",
      allowsBulkOrdering: false,
      meat: false,
      dairy: true,
      chalavYisrael: true,
      parev: false,
      mehadrin: true,
    },
    documents: [
      {
        purpose: "ADDRESS",
        title: "Proof of address",
        lines: [
          "Proof of residential address",
          "Rivka Levy trading as Levy Home Bakery",
          "18 Regent Road, Sea Point, Cape Town, 8005",
          "Test document only.",
        ],
      },
      {
        purpose: "JEWISH_PROOF",
        title: "Rabbinical verification",
        lines: [
          "Rabbinical verification letter",
          "I confirm Rivka Levy is a member of our congregation.",
          "Rabbi Shlomo Katz",
          "Sea Point Hebrew Congregation. Test document only.",
        ],
      },
      {
        purpose: "BETH_DIN",
        title: "Beth Din certificate",
        lines: [
          "Cape Town Beth Din certificate",
          "Brand: Levy Home Bakery",
          "Certificate CT-BD-2022-118",
          "Dairy, chalav Yisrael, mehadrin. Test document only.",
        ],
      },
    ],
  },
  {
    legalName: "Cohen and Kaplan Attorneys",
    tradingName: "Cohen & Kaplan",
    registrationType: "PARTNERSHIP",
    businessModel: "B2B",
    operationalFormat: "PHYSICAL",
    websiteUrl: "https://cohenkaplan.example.com",
    contactName: "Miriam Cohen",
    contactPhone: "+27113284560",
    contactEmail: "miriam.cohen@example.com",
    industrySlug: "professional-services",
    tagSlugs: ["legal"],
    customDescription: "Partnership advising Jewish families and communal organisations on trusts, wills, and commercial contracts.",
    jewishOwnershipPercentage: 100,
    synagogueName: "Oxford Shul",
    rabbiContactName: "Rabbi Asher Friedman",
    rabbiContactPhone: "+27118804519",
    offersDiscount: true,
    discountDetails: "First consultation at no charge for new communal organisations referred by a rabbi.",
    location: {
      branchName: "Rosebank chambers",
      addressLine1: "7 Sturdee Avenue",
      suburb: "Rosebank",
      city: "JOHANNESBURG",
      postalCode: "2196",
      latitude: -26.1449,
      longitude: 28.0416,
    },
    documents: [
      {
        purpose: "ADDRESS",
        title: "Proof of address",
        lines: [
          "Lease confirmation",
          "Cohen and Kaplan Attorneys",
          "7 Sturdee Avenue, Rosebank, Johannesburg, 2196",
          "Test document only.",
        ],
      },
      {
        purpose: "JEWISH_PROOF",
        title: "Rabbinical verification",
        lines: [
          "Rabbinical verification letter",
          "I confirm Miriam Cohen and Daniel Kaplan are members of our congregation.",
          "Rabbi Asher Friedman",
          "Oxford Shul. Test document only.",
        ],
      },
    ],
  },
  {
    legalName: "The Kaplan Family Trust",
    tradingName: "Kaplan Estates",
    registrationType: "TRUST",
    businessModel: "BOTH",
    operationalFormat: "HYBRID",
    websiteUrl: "https://kaplan-estates.example.com",
    contactName: "Aaron Kaplan",
    contactPhone: "+27216710455",
    contactEmail: "aaron.kaplan@example.com",
    industrySlug: "property-construction",
    tagSlugs: ["estate-agency", "property-management"],
    customDescription: "Family trust letting and selling homes in the Cape Town Jewish suburbs, including Sea Point and Claremont.",
    jewishOwnershipPercentage: 100,
    synagogueName: "Gardens Shul",
    rabbiContactName: "Rabbi Eliyahu Stein",
    rabbiContactPhone: "+27214658830",
    offersDiscount: false,
    location: {
      branchName: "Gardens office",
      addressLine1: "88 Hatfield Street",
      suburb: "Gardens",
      city: "CAPE_TOWN",
      postalCode: "8001",
      latitude: -33.9302,
      longitude: 18.4145,
    },
    documents: [
      {
        purpose: "ADDRESS",
        title: "Proof of address",
        lines: [
          "Trust correspondence address",
          "The Kaplan Family Trust trading as Kaplan Estates",
          "88 Hatfield Street, Gardens, Cape Town, 8001",
          "Test document only.",
        ],
      },
      {
        purpose: "JEWISH_PROOF",
        title: "Rabbinical verification",
        lines: [
          "Rabbinical verification letter",
          "I confirm the Kaplan family trustees are members of our congregation.",
          "Rabbi Eliyahu Stein",
          "Gardens Shul. Test document only.",
        ],
      },
    ],
  },
  {
    legalName: "Shapiro Textiles Proprietary Limited",
    tradingName: "Shapiro & Sons",
    registrationType: "CIPC_REGISTERED_COMPANY",
    cipcNumber: "2004/091772/07",
    businessModel: "BOTH",
    operationalFormat: "PHYSICAL",
    websiteUrl: "https://shapiro-and-sons.example.com",
    contactName: "Leah Shapiro",
    contactPhone: "+27113347820",
    contactEmail: "leah.shapiro@example.com",
    industrySlug: "retail-trade",
    tagSlugs: ["clothing", "wholesale"],
    customDescription: "Third-generation clothing wholesaler and shop in Doornfontein, supplying shuls and schools for uniforms and simchas.",
    jewishOwnershipPercentage: 80,
    synagogueName: "Great Park Synagogue",
    rabbiContactName: "Rabbi Menachem Bloch",
    rabbiContactPhone: "+27118871264",
    offersDiscount: true,
    discountDetails: "15 percent off school uniform orders placed by a registered Jewish school.",
    location: {
      branchName: "Doornfontein warehouse",
      addressLine1: "15 Siemert Road",
      suburb: "Doornfontein",
      city: "JOHANNESBURG",
      postalCode: "2094",
      latitude: -26.1964,
      longitude: 28.0538,
    },
    documents: [
      {
        purpose: "CIPC",
        title: "CIPC registration",
        lines: [
          "CIPC registration certificate",
          "Shapiro Textiles Proprietary Limited",
          "Registration 2004/091772/07",
          "Issued for directory vetting. Test document only.",
        ],
      },
      {
        purpose: "ADDRESS",
        title: "Proof of address",
        lines: [
          "Rates account",
          "Shapiro Textiles Proprietary Limited",
          "15 Siemert Road, Doornfontein, Johannesburg, 2094",
          "Test document only.",
        ],
      },
      {
        purpose: "JEWISH_PROOF",
        title: "Rabbinical verification",
        lines: [
          "Rabbinical verification letter",
          "I confirm the Shapiro family holds 80 percent of this company and belongs to our congregation.",
          "Rabbi Menachem Bloch",
          "Great Park Synagogue. Test document only.",
        ],
      },
    ],
  },
]

function pdfBytes(lines: string[]) {
  const commands = lines
    .map((line, index) => {
      const safe = line.replace(/[()\\]/g, "")
      return `BT /F1 14 Tf 72 ${740 - index * 24} Td (${safe}) Tj ET`
    })
    .join("\n")
  const stream = `${commands}\n`
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n",
    `4 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}endstream\nendobj\n`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
  ]
  let body = "%PDF-1.4\n"
  const offsets = [0]
  for (const object of objects) {
    offsets.push(Buffer.byteLength(body))
    body += object
  }
  const xrefAt = Buffer.byteLength(body)
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let index = 1; index <= objects.length; index += 1) {
    xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`
  }
  body += xref
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`
  return Buffer.from(body)
}

function statusTokenHash() {
  const token = randomBytes(32).toString("base64url")
  return createHash("sha256").update(token).digest("hex")
}

type StorageUploader = {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        body: Buffer,
        options: { contentType: string; upsert: boolean },
      ): Promise<{ error: { message: string } | null }>
    }
  }
}

async function uploadDocument(
  storage: StorageUploader,
  bucket: string,
  listingName: string,
  document: DocSpec,
) {
  const bytes = pdfBytes([document.title, listingName, ...document.lines])
  const objectKey = `${document.purpose.toLowerCase()}/${randomUUID()}`
  const { error } = await storage.storage.from(bucket).upload(objectKey, bytes, {
    contentType: "application/pdf",
    upsert: false,
  })
  if (error) {
    throw new Error(`Upload failed for ${listingName} ${document.purpose}: ${error.message}`)
  }
  await prisma.documentUpload.create({
    data: {
      purpose: document.purpose,
      objectKey,
      mimeType: "application/pdf",
      sizeBytes: bytes.length,
      consumedAt: new Date(),
    },
  })
  return objectKey
}

async function main() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")
  }
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "business-documents"
  const storage = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: buckets, error: bucketError } = await storage.storage.listBuckets()
  if (bucketError) throw new Error(bucketError.message)
  if (!buckets?.some((entry) => entry.name === bucket)) {
    const created = await storage.storage.createBucket(bucket, { public: false })
    if (created.error) throw new Error(created.error.message)
  }

  const created: { refCode: string; tradingName: string; documents: number }[] = []

  for (const listing of listings) {
    const existing = await prisma.business.findFirst({ where: { legalName: listing.legalName }, select: { refCode: true, tradingName: true } })
    if (existing) {
      console.log(`skip ${existing.refCode} ${existing.tradingName}`)
      continue
    }

    const industry = await prisma.industry.findUnique({
      where: { slug: listing.industrySlug },
      include: { tags: true },
    })
    if (!industry) throw new Error(`Missing industry ${listing.industrySlug}. Run the database seed first.`)
    const tags = listing.tagSlugs.map((slug) => {
      const tag = industry.tags.find((entry) => entry.slug === slug)
      if (!tag) throw new Error(`Missing tag ${slug} on ${listing.industrySlug}.`)
      return tag
    })
    const synagogue = await prisma.synagogue.findFirst({ where: { name: listing.synagogueName } })
    if (!synagogue) throw new Error(`Missing synagogue ${listing.synagogueName}. Run the database seed first.`)

    const keys = new Map<DocumentPurpose, string>()
    for (const document of listing.documents) {
      keys.set(document.purpose, await uploadDocument(storage, bucket, listing.tradingName, document))
    }

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
          legalName: listing.legalName,
          tradingName: listing.tradingName,
          registrationType: listing.registrationType,
          cipcNumber: listing.cipcNumber,
          cipcDocKey: keys.get("CIPC"),
          proofOfAddressKey: keys.get("ADDRESS")!,
          businessModel: listing.businessModel,
          operationalFormat: listing.operationalFormat,
          websiteUrl: listing.websiteUrl,
          contactName: listing.contactName,
          contactPhone: listing.contactPhone,
          contactEmail: listing.contactEmail,
          industryId: industry.id,
          customDescription: listing.customDescription,
          jewishOwnershipPercentage: listing.jewishOwnershipPercentage,
          synagogueId: synagogue.id,
          rabbiContactName: listing.rabbiContactName,
          rabbiContactPhone: listing.rabbiContactPhone,
          jewishProofDocKey: keys.get("JEWISH_PROOF")!,
          offersDiscount: listing.offersDiscount,
          discountDetails: listing.discountDetails,
          status: "PENDING_REVIEW",
          isTest: true,
          consentAccepted: true,
          accuracyDeclared: true,
          statusTokenHash: statusTokenHash(),
          locations: {
            create: {
              ...listing.location,
              isPrimary: true,
            },
          },
          tags: { create: tags.map((tag) => ({ tagId: tag.id })) },
          kosherCertification: listing.kosher
            ? {
                create: {
                  ...listing.kosher,
                  certDocKey: keys.get("BETH_DIN")!,
                },
              }
            : undefined,
        },
        select: { refCode: true, tradingName: true, status: true },
      })
    })

    created.push({
      refCode: business.refCode,
      tradingName: business.tradingName ?? listing.tradingName,
      documents: listing.documents.length,
    })
    console.log(`${business.refCode} ${business.tradingName} ${business.status} docs=${listing.documents.length}`)
  }

  console.log(`created ${created.length}`)
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
