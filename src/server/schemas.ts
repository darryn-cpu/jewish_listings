import { z } from "zod"
import { ApiError } from "@/server/errors"
import { isAllowedMime, MAX_UPLOAD_BYTES } from "@/server/uploads"

const registrationTypes = ["CIPC_REGISTERED_COMPANY", "SOLE_PROPRIETOR", "PARTNERSHIP", "TRUST"] as const
const businessModels = ["B2B", "B2C", "BOTH"] as const
const operationalFormats = ["PHYSICAL", "ONLINE", "HYBRID"] as const
const cities = ["JOHANNESBURG", "CAPE_TOWN"] as const

function requiredText(max: number, label: string) {
  return z.string().trim().min(1, `${label} is required.`).max(max)
}

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => {
      const trimmed = value?.trim() ?? ""
      return trimmed.length ? trimmed : undefined
    })
}

export const saPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine((value) => /^(?:\+27|0)\d{9}$/.test(value), "Enter a South African phone number.")

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .nullish()
  .transform((value) => {
    const trimmed = value?.trim() ?? ""
    return trimmed.length ? trimmed : undefined
  })
  .refine((value) => value === undefined || /^https?:\/\/\S+$/.test(value), "Enter a website starting with http:// or https://.")

const postalCode = z
  .string()
  .trim()
  .nullish()
  .transform((value) => {
    const trimmed = value?.trim() ?? ""
    return trimmed.length ? trimmed : undefined
  })
  .refine((value) => value === undefined || /^\d{4}$/.test(value), "Enter a 4-digit postal code.")

export const locationSchema = z
  .object({
    branchName: optionalText(80),
    addressLine1: optionalText(160),
    addressLine2: optionalText(160),
    suburb: requiredText(80, "Suburb"),
    city: z.enum(cities),
    postalCode,
    latitude: z.number().gte(-90).lte(90).nullable().optional(),
    longitude: z.number().gte(-180).lte(180).nullable().optional(),
    isPrimary: z.boolean().optional().default(false),
  })
  .superRefine((location, ctx) => {
    const hasLat = location.latitude != null
    const hasLng = location.longitude != null
    if (hasLat !== hasLng) {
      ctx.addIssue({ code: "custom", message: "Enter both latitude and longitude.", path: ["latitude"] })
    }
  })

export const identitySchema = z.object({
  legalName: requiredText(160, "Legal name"),
  tradingName: optionalText(160),
  registrationType: z.enum(registrationTypes),
  cipcNumber: z
    .string()
    .trim()
    .nullish()
    .transform((value) => {
      const trimmed = value?.trim() ?? ""
      return trimmed.length ? trimmed : undefined
    }),
  cipcUploadId: optionalText(64),
  proofOfAddressUploadId: requiredText(64, "Proof of address"),
})

export const operationsSchema = z.object({
  businessModel: z.enum(businessModels),
  operationalFormat: z.enum(operationalFormats),
  websiteUrl: optionalUrl,
  contactName: requiredText(120, "Contact name"),
  contactPhone: saPhoneSchema,
  contactEmail: z.string().trim().email("Enter a valid email address.").max(160).transform((value) => value.toLowerCase()),
  locations: z.array(locationSchema).min(1, "Add at least one branch.").max(15),
})

export const categorizationSchema = z.object({
  industryId: requiredText(64, "Industry"),
  tagIds: z.array(z.string().trim().min(1).max(64)).min(1, "Choose at least one service tag.").max(12),
  customDescription: z
    .string()
    .trim()
    .max(250, "The description can be at most 250 characters.")
    .nullish()
    .transform((value) => {
      const trimmed = value?.trim() ?? ""
      return trimmed.length ? trimmed : undefined
    }),
})

export const ownershipSchema = z.object({
  jewishOwnershipPercentage: z.number().int().min(1).max(100),
  synagogueId: optionalText(64),
  synagogueOtherName: optionalText(160),
  rabbiContactName: requiredText(120, "Rabbi name"),
  rabbiContactPhone: saPhoneSchema,
  jewishProofUploadId: requiredText(64, "Rabbinical document"),
})

export const kosherSchema = z.object({
  brandName: optionalText(160),
  bethDinCertNumber: optionalText(80),
  certUploadId: optionalText(64),
  allowsBulkOrdering: z.boolean().optional().default(false),
  meat: z.boolean().optional().default(false),
  dairy: z.boolean().optional().default(false),
  chalavYisrael: z.boolean().optional().default(false),
  parev: z.boolean().optional().default(false),
  mehadrin: z.boolean().optional().default(false),
}).superRefine((kosher, ctx) => {
  const started = Boolean(kosher.brandName || kosher.bethDinCertNumber || kosher.certUploadId)
  if (!started) return
  if (!kosher.brandName) {
    ctx.addIssue({ code: "custom", path: ["brandName"], message: "Kosher brand is required." })
  }
  if (!kosher.bethDinCertNumber) {
    ctx.addIssue({ code: "custom", path: ["bethDinCertNumber"], message: "Beth Din certificate number is required." })
  }
  if (!kosher.certUploadId) {
    ctx.addIssue({ code: "custom", path: ["certUploadId"], message: "Beth Din certificate is required." })
  }
})

export const legalSchema = z.object({
  offersDiscount: z.boolean(),
  discountDetails: optionalText(500),
  consentAccepted: z.literal(true, {
    errorMap: () => ({ message: "Publishing consent is required." }),
  }),
  accuracyDeclared: z.literal(true, {
    errorMap: () => ({ message: "The accuracy declaration is required." }),
  }),
})

export const applicationSchema = z
  .object({
    identity: identitySchema,
    operations: operationsSchema,
    categorization: categorizationSchema,
    ownership: ownershipSchema,
    kosher: kosherSchema.nullish().transform((value) => value ?? undefined),
    legal: legalSchema,
    turnstileToken: z.string().trim().max(2048).optional(),
  })
  .superRefine((application, ctx) => {
    const company = application.identity.registrationType === "CIPC_REGISTERED_COMPANY"
    if (company) {
      if (!application.identity.cipcNumber || !/^\d{4}\/\d{6}\/\d{2}$/.test(application.identity.cipcNumber)) {
        ctx.addIssue({
          code: "custom",
          path: ["identity", "cipcNumber"],
          message: "Enter a CIPC number like 2020/123456/07.",
        })
      }
      if (!application.identity.cipcUploadId) {
        ctx.addIssue({
          code: "custom",
          path: ["identity", "cipcUploadId"],
          message: "Upload the CIPC registration document.",
        })
      }
    } else if (application.identity.cipcNumber || application.identity.cipcUploadId) {
      ctx.addIssue({
        code: "custom",
        path: ["identity", "cipcNumber"],
        message: "CIPC details are only collected for a registered company.",
      })
    }

    const primaryCount = application.operations.locations.filter((location) => location.isPrimary).length
    if (primaryCount > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["operations", "locations"],
        message: "Mark one branch as the primary branch.",
      })
    }

    if (application.operations.operationalFormat !== "ONLINE") {
      application.operations.locations.forEach((location, index) => {
        if (!location.addressLine1) {
          ctx.addIssue({
            code: "custom",
            path: ["operations", "locations", index, "addressLine1"],
            message: "Enter the street address.",
          })
        }
      })
    }

    const hasSynagogue = Boolean(application.ownership.synagogueId)
    const hasOtherSynagogue = Boolean(application.ownership.synagogueOtherName)
    if (hasSynagogue === hasOtherSynagogue) {
      ctx.addIssue({
        code: "custom",
        path: ["ownership", "synagogueId"],
        message: "Choose a synagogue or enter its name.",
      })
    }

    if (application.legal.offersDiscount && !application.legal.discountDetails) {
      ctx.addIssue({
        code: "custom",
        path: ["legal", "discountDetails"],
        message: "Describe the community discount.",
      })
    }
    if (!application.legal.offersDiscount && application.legal.discountDetails) {
      ctx.addIssue({
        code: "custom",
        path: ["legal", "discountDetails"],
        message: "Remove the discount terms or turn the offer on.",
      })
    }

    const uploadIds = [
      application.identity.cipcUploadId,
      application.identity.proofOfAddressUploadId,
      application.ownership.jewishProofUploadId,
      application.kosher?.certUploadId,
    ].filter((value): value is string => Boolean(value))
    if (new Set(uploadIds).size !== uploadIds.length) {
      ctx.addIssue({ code: "custom", path: ["identity", "proofOfAddressUploadId"], message: "Each document must be a separate upload." })
    }
  })

export type ApplicationInput = z.infer<typeof applicationSchema>

export const presignSchema = z.object({
  purpose: z.enum(["CIPC", "ADDRESS", "JEWISH_PROOF", "BETH_DIN"]),
  mimeType: z.string().refine(isAllowedMime, "Upload a PDF, JPEG, PNG, or WebP file."),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES, "Files must be 10 MB or smaller."),
})

export const loginSchema = z.object({
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(200),
})

export const createReviewerSchema = z.object({
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
  password: z.string().min(10, "Use at least 10 characters.").max(200),
  role: z.enum(["SUPERADMIN", "REVIEWER"]).default("REVIEWER"),
})

export const listingVisibilitySchema = z.object({
  disabled: z.boolean(),
})

export const publicListingFilter = {
  status: "APPROVED" as const,
  disabledAt: null,
}

export const statusChangeSchema = z.object({
  status: z.enum(["PENDING_REVIEW", "REQUIRES_INFO", "APPROVED", "REJECTED"]),
  applicantMessage: z.string().trim().max(2000).optional(),
  reviewerNotes: z.string().trim().max(4000).optional(),
  reasonCode: z
    .enum(["INCOMPLETE_DOCUMENTS", "OWNERSHIP_UNVERIFIED", "OUTSIDE_SERVICE_AREA", "DUPLICATE", "FAILED_REFERENCE", "OTHER"])
    .optional(),
})

const directoryCities = z.enum(["JOHANNESBURG", "CAPE_TOWN", "OTHER"])

export type DirectoryQuery = {
  search?: string
  city?: z.infer<typeof directoryCities>
  category?: string
  b2b: boolean
  b2c: boolean
  kosherOnly: boolean
  page: number
  limit: number
  lat?: number
  lng?: number
  radiusKm?: number
}

function flag(value: string | null) {
  return value === "true"
}

function numberParam(value: string | null, label: string) {
  if (value == null || value === "") return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new ApiError(400, "VALIDATION_ERROR", `${label} must be a number.`)
  }
  return parsed
}

export function parseDirectoryQuery(params: URLSearchParams): DirectoryQuery {
  const search = params.get("search")?.trim()
  if (search && search.length > 80) {
    throw new ApiError(400, "VALIDATION_ERROR", "Search text can be at most 80 characters.")
  }
  const cityValue = params.get("city")
  const city = cityValue ? directoryCities.parse(cityValue) : undefined
  const category = params.get("category")?.trim() || undefined
  if (category && !/^[a-z0-9-]{1,80}$/.test(category)) {
    throw new ApiError(400, "VALIDATION_ERROR", "The category filter is not recognised.")
  }
  const page = numberParam(params.get("page"), "page") ?? 1
  const requestedLimit = numberParam(params.get("limit"), "limit") ?? 20
  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError(400, "VALIDATION_ERROR", "Page must be a positive whole number.")
  }
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    throw new ApiError(400, "VALIDATION_ERROR", "Limit must be a positive whole number.")
  }
  const lat = numberParam(params.get("lat"), "lat")
  const lng = numberParam(params.get("lng"), "lng")
  const radiusKm = numberParam(params.get("radiusKm"), "radiusKm")
  if ((lat == null) !== (lng == null)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Latitude and longitude are both required for a radius search.")
  }
  if (lat != null && (lat < -90 || lat > 90 || lng! < -180 || lng! > 180)) {
    throw new ApiError(400, "VALIDATION_ERROR", "The map coordinates are out of range.")
  }
  if (radiusKm != null && (radiusKm <= 0 || radiusKm > 200)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Radius must be between 0 and 200 kilometres.")
  }
  return {
    search: search || undefined,
    city,
    category,
    b2b: flag(params.get("b2b")),
    b2c: flag(params.get("b2c")),
    kosherOnly: flag(params.get("kosherOnly")),
    page,
    limit: Math.min(requestedLimit, 50),
    lat,
    lng,
    radiusKm,
  }
}

export function directoryWhere(query: DirectoryQuery) {
  const filters: Record<string, unknown>[] = []
  if (query.search) {
    filters.push({
      OR: [
        { legalName: { contains: query.search, mode: "insensitive" } },
        { tradingName: { contains: query.search, mode: "insensitive" } },
        { customDescription: { contains: query.search, mode: "insensitive" } },
        { locations: { some: { suburb: { contains: query.search, mode: "insensitive" } } } },
        { tags: { some: { tag: { name: { contains: query.search, mode: "insensitive" } } } } },
      ],
    })
  }
  if (query.city) {
    filters.push({ locations: { some: { city: query.city } } })
  }
  if (query.category) {
    filters.push({
      OR: [
        { industry: { slug: query.category } },
        { industry: { parent: { slug: query.category } } },
        { tags: { some: { tag: { slug: query.category } } } },
      ],
    })
  }
  if (query.b2b && !query.b2c) {
    filters.push({ businessModel: { in: ["B2B", "BOTH"] } })
  }
  if (query.b2c && !query.b2b) {
    filters.push({ businessModel: { in: ["B2C", "BOTH"] } })
  }
  if (query.kosherOnly) {
    filters.push({ kosherCertification: { isNot: null } })
  }
  return {
    ...publicListingFilter,
    ...(filters.length ? { AND: filters } : {}),
  }
}
