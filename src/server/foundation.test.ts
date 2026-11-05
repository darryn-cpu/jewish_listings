import { describe, expect, it } from "vitest"
import { haversineKm } from "@/server/haversine"
import { receiptEmail, requiresInfoEmail } from "@/server/mailTemplates"
import { toPublicDetail } from "@/server/publicDto"
import { formatRefCode, isRefCode } from "@/server/refCode"
import { applicationSchema, directoryWhere, parseDirectoryQuery } from "@/server/schemas"
import { assertTransition, canTransition, TransitionError } from "@/server/stateMachine"
import { createStatusToken, hashStatusToken, tokenMatches } from "@/server/token"

function application(overrides: Record<string, unknown> = {}) {
  return {
    identity: {
      legalName: "Bagel Zone (Pty) Ltd",
      tradingName: "Bagel Zone",
      registrationType: "CIPC_REGISTERED_COMPANY",
      cipcNumber: "2020/123456/07",
      cipcUploadId: "upload-cipc",
      proofOfAddressUploadId: "upload-address",
    },
    operations: {
      businessModel: "B2C",
      operationalFormat: "PHYSICAL",
      websiteUrl: "https://bagelzone.co.za",
      contactName: "Ada Cohen",
      contactPhone: "082 123 4567",
      contactEmail: "Ada@BagelZone.co.za",
      locations: [
        {
          branchName: "Fairmount",
          addressLine1: "Genesis Shopping Centre",
          suburb: "Fairmount",
          city: "JOHANNESBURG",
          postalCode: "2192",
          isPrimary: true,
        },
      ],
    },
    categorization: {
      industryId: "industry-food",
      tagIds: ["tag-bakery"],
      customDescription: "Boiled bagels.",
    },
    ownership: {
      jewishOwnershipPercentage: 100,
      synagogueId: "shul-1",
      rabbiContactName: "Rabbi Example",
      rabbiContactPhone: "+27 82 123 4567",
      jewishProofUploadId: "upload-proof",
    },
    legal: {
      offersDiscount: true,
      discountDetails: "10% for community members",
      consentAccepted: true,
      accuracyDeclared: true,
    },
    ...overrides,
  }
}

describe("reference codes", () => {
  it("formats a yearly code", () => {
    expect(formatRefCode(2026, 42)).toBe("JBD-2026-0042")
    expect(isRefCode("JBD-2026-0042")).toBe(true)
    expect(isRefCode("JBD-26-42")).toBe(false)
  })
})

describe("status tokens", () => {
  it("stores a hash that matches only the original token", () => {
    const issued = createStatusToken()
    expect(issued.hash).toBe(hashStatusToken(issued.token))
    expect(tokenMatches(issued.token, issued.hash)).toBe(true)
    expect(tokenMatches(`${issued.token}x`, issued.hash)).toBe(false)
  })
})

describe("vetting transitions", () => {
  it("allows the review paths and stops terminal states", () => {
    expect(canTransition("PENDING_REVIEW", "APPROVED")).toBe(true)
    expect(canTransition("PENDING_REVIEW", "REQUIRES_INFO")).toBe(true)
    expect(canTransition("REQUIRES_INFO", "PENDING_REVIEW")).toBe(true)
    expect(canTransition("APPROVED", "REJECTED")).toBe(false)
    expect(() => assertTransition("REJECTED", "PENDING_REVIEW")).toThrow(TransitionError)
  })
})

describe("application schema", () => {
  it("accepts a complete company application", () => {
    const parsed = applicationSchema.parse(application())
    expect(parsed.operations.contactEmail).toBe("ada@bagelzone.co.za")
    expect(parsed.operations.contactPhone).toBe("0821234567")
  })

  it("rejects ownership outside 1 to 100, long descriptions, and missing consent", () => {
    expect(applicationSchema.safeParse(application({
      ownership: { ...application().ownership, jewishOwnershipPercentage: 0 },
    })).success).toBe(false)
    expect(applicationSchema.safeParse(application({
      categorization: { ...application().categorization, customDescription: "a".repeat(251) },
    })).success).toBe(false)
    expect(applicationSchema.safeParse(application({
      legal: { ...application().legal, consentAccepted: false },
    })).success).toBe(false)
  })

  it("requires CIPC only for companies and a street only for physical premises", () => {
    expect(applicationSchema.safeParse(application({
      identity: { ...application().identity, cipcNumber: undefined, cipcUploadId: undefined },
    })).success).toBe(false)
    const sole = application({
      identity: {
        legalName: "Ada Cohen",
        registrationType: "SOLE_PROPRIETOR",
        proofOfAddressUploadId: "upload-address",
      },
    })
    expect(applicationSchema.safeParse(sole).success).toBe(true)
    expect(applicationSchema.safeParse(application({
      operations: {
        ...application().operations,
        operationalFormat: "ONLINE",
        locations: [{ suburb: "Sea Point", city: "CAPE_TOWN", isPrimary: true }],
      },
    })).success).toBe(true)
    expect(applicationSchema.safeParse(application({
      operations: {
        ...application().operations,
        locations: [{ suburb: "Sea Point", city: "CAPE_TOWN", isPrimary: true }],
      },
    })).success).toBe(false)
  })

  it("requires a complete kosher block and one synagogue answer", () => {
    expect(applicationSchema.safeParse(application({
      kosher: { brandName: "Bagel Zone" },
    })).success).toBe(false)
    expect(applicationSchema.safeParse(application({
      kosher: {
        brandName: "Bagel Zone",
        bethDinCertNumber: "BD-100",
        certUploadId: "upload-kosher",
        allowsBulkOrdering: false,
      },
    })).success).toBe(true)
    expect(applicationSchema.safeParse(application({
      kosher: { meat: true },
    })).success).toBe(true)
    expect(applicationSchema.safeParse(application({
      ownership: { ...application().ownership, synagogueId: undefined, synagogueOtherName: undefined },
    })).success).toBe(false)
  })
})

describe("directory query", () => {
  it("keeps the public query on approved businesses and clamps the page size", () => {
    const query = parseDirectoryQuery(new URLSearchParams("search=bagel&city=CAPE_TOWN&category=bakery&b2b=true&kosherOnly=true&limit=80"))
    expect(query.limit).toBe(50)
    expect(directoryWhere(query)).toMatchObject({
      status: "APPROVED",
      disabledAt: null,
      AND: expect.arrayContaining([
        { locations: { some: { city: "CAPE_TOWN" } } },
        { kosherCertification: { isNot: null } },
        { businessModel: { in: ["B2B", "BOTH"] } },
      ]),
    })
  })

  it("rejects an unknown city", () => {
    expect(() => parseDirectoryQuery(new URLSearchParams("city=DURBAN"))).toThrow()
  })
})

describe("public directory records", () => {
  it("omits vetting documents, reviewer notes, and ownership", () => {
    const detail = toPublicDetail({
      id: "biz-1",
      legalName: "Bagel Zone (Pty) Ltd",
      tradingName: "Bagel Zone",
      customDescription: "Boiled bagels.",
      businessModel: "B2C",
      operationalFormat: "PHYSICAL",
      websiteUrl: "https://bagelzone.co.za",
      contactName: "Ada Cohen",
      contactPhone: "0821234567",
      contactEmail: "ada@bagelzone.co.za",
      offersDiscount: true,
      discountDetails: "10%",
      industry: { slug: "food-hospitality", name: "Kosher food and hospitality" },
      tags: [{ tag: { slug: "bakery", name: "Bakeries" } }],
      locations: [{
        id: "loc-1",
        branchName: null,
        addressLine1: "Genesis",
        addressLine2: null,
        suburb: "Fairmount",
        city: "JOHANNESBURG",
        postalCode: "2192",
        latitude: null,
        longitude: null,
        isPrimary: true,
      }],
      kosherCertification: {
        brandName: "Bagel Zone",
        bethDinCertNumber: "BD-100",
        allowsBulkOrdering: false,
        meat: false,
        dairy: true,
        chalavYisrael: true,
        parev: true,
        mehadrin: false,
        certDocKey: "secret-key",
      },
      reviewerNotes: "internal",
      jewishOwnershipPercentage: 100,
      rabbiContactPhone: "+27821234567",
      cipcDocKey: "secret-cipc",
    })
    expect(detail).not.toHaveProperty("reviewerNotes")
    expect(detail).not.toHaveProperty("jewishOwnershipPercentage")
    expect(detail).not.toHaveProperty("rabbiContactPhone")
    expect(detail).not.toHaveProperty("cipcDocKey")
    expect(detail.kosher).not.toHaveProperty("certDocKey")
    expect(JSON.stringify(detail)).not.toContain("secret-key")
    expect(detail.kosher?.dairy).toBe(true)
    expect(detail.name).toBe("Bagel Zone")
  })
})

describe("mail", () => {
  it("includes the reference in both applicant messages", () => {
    expect(receiptEmail({ refCode: "JBD-2026-0001", statusUrl: "https://example.test/status" }).text).toContain("JBD-2026-0001")
    expect(requiresInfoEmail({ refCode: "JBD-2026-0001", message: "Upload a clearer CIPC scan.", statusUrl: "https://example.test/status" }).text).toContain("clearer CIPC")
  })
})

describe("distance", () => {
  it("measures Johannesburg to Cape Town in kilometres", () => {
    const distance = haversineKm(-26.2041, 28.0473, -33.9249, 18.4241)
    expect(distance).toBeGreaterThan(1200)
    expect(distance).toBeLessThan(1350)
  })
})
