import { CITY_LABEL, type CityCode } from "@/lib/labels"
import { haversineKm } from "@/server/haversine"

type Numeric = { toString(): string } | number | null | undefined

export type SourceLocation = {
  id: string
  branchName: string | null
  addressLine1: string | null
  addressLine2: string | null
  suburb: string
  city: CityCode
  postalCode: string | null
  latitude: Numeric
  longitude: Numeric
  isPrimary: boolean
}

export type SourceTag = { tag: { slug: string; name: string } }

export type SourceKosher = {
  brandName: string
  bethDinCertNumber: string
  allowsBulkOrdering: boolean
  meat: boolean
  dairy: boolean
  chalavYisrael: boolean
  parev: boolean
  mehadrin: boolean
  certDocKey?: string
} | null

export type PublicSource = {
  id: string
  legalName: string
  tradingName: string | null
  customDescription: string | null
  businessModel: "B2B" | "B2C" | "BOTH"
  operationalFormat: "PHYSICAL" | "ONLINE" | "HYBRID"
  websiteUrl: string | null
  contactName: string
  contactPhone: string
  contactEmail: string
  offersDiscount: boolean
  discountDetails: string | null
  isTest?: boolean
  industry: { slug: string; name: string }
  tags: SourceTag[]
  locations: SourceLocation[]
  kosherCertification: SourceKosher
  reviewerNotes?: string | null
  jewishOwnershipPercentage?: number
  cipcNumber?: string | null
  cipcDocKey?: string | null
  proofOfAddressKey?: string
  jewishProofDocKey?: string
  rabbiContactName?: string
  rabbiContactPhone?: string
  statusTokenHash?: string
}

export type PublicLocation = {
  id: string
  branchName: string | null
  addressLine1: string | null
  addressLine2: string | null
  suburb: string
  city: CityCode
  cityLabel: string
  postalCode: string | null
  latitude: number | null
  longitude: number | null
  isPrimary: boolean
}

export type PublicKosher = {
  brandName: string
  bethDinCertNumber: string
  allowsBulkOrdering: boolean
  meat: boolean
  dairy: boolean
  chalavYisrael: boolean
  parev: boolean
  mehadrin: boolean
}

export type PublicListItem = {
  id: string
  name: string
  description: string | null
  businessModel: PublicSource["businessModel"]
  industry: { slug: string; name: string }
  tags: { slug: string; name: string }[]
  suburb: string
  city: CityCode
  cityLabel: string
  offersDiscount: boolean
  isTest: boolean
  kosher: PublicKosher | null
  distanceKm: number | null
}

export type PublicDetail = PublicListItem & {
  legalName: string
  tradingName: string | null
  operationalFormat: PublicSource["operationalFormat"]
  websiteUrl: string | null
  contactName: string
  contactPhone: string
  contactEmail: string
  discountDetails: string | null
  locations: PublicLocation[]
}

function asNumber(value: Numeric) {
  if (value == null) return null
  const parsed = Number(value.toString())
  return Number.isFinite(parsed) ? parsed : null
}

function kosherOf(source: SourceKosher): PublicKosher | null {
  if (!source) return null
  return {
    brandName: source.brandName,
    bethDinCertNumber: source.bethDinCertNumber,
    allowsBulkOrdering: source.allowsBulkOrdering,
    meat: source.meat,
    dairy: source.dairy,
    chalavYisrael: source.chalavYisrael,
    parev: source.parev,
    mehadrin: source.mehadrin,
  }
}

export function toPublicLocation(location: SourceLocation): PublicLocation {
  return {
    id: location.id,
    branchName: location.branchName,
    addressLine1: location.addressLine1,
    addressLine2: location.addressLine2,
    suburb: location.suburb,
    city: location.city,
    cityLabel: CITY_LABEL[location.city],
    postalCode: location.postalCode,
    latitude: asNumber(location.latitude),
    longitude: asNumber(location.longitude),
    isPrimary: location.isPrimary,
  }
}

export function nearestDistanceKm(locations: SourceLocation[], lat?: number, lng?: number) {
  if (lat == null || lng == null) return null
  let best: number | null = null
  for (const location of locations) {
    const locationLat = asNumber(location.latitude)
    const locationLng = asNumber(location.longitude)
    if (locationLat == null || locationLng == null) continue
    const distance = haversineKm(lat, lng, locationLat, locationLng)
    if (best == null || distance < best) best = distance
  }
  return best
}

export function toPublicListItem(source: PublicSource, distanceKm: number | null = null): PublicListItem {
  const primary = source.locations.find((location) => location.isPrimary) ?? source.locations[0]
  return {
    id: source.id,
    name: source.tradingName || source.legalName,
    description: source.customDescription,
    businessModel: source.businessModel,
    industry: source.industry,
    tags: source.tags.map((entry) => entry.tag),
    suburb: primary?.suburb ?? "",
    city: primary?.city ?? "JOHANNESBURG",
    cityLabel: primary ? CITY_LABEL[primary.city] : "",
    offersDiscount: source.offersDiscount,
    isTest: source.isTest === true,
    kosher: kosherOf(source.kosherCertification),
    distanceKm,
  }
}

export function toPublicDetail(source: PublicSource, distanceKm: number | null = null): PublicDetail {
  return {
    ...toPublicListItem(source, distanceKm),
    legalName: source.legalName,
    tradingName: source.tradingName,
    operationalFormat: source.operationalFormat,
    websiteUrl: source.websiteUrl,
    contactName: source.contactName,
    contactPhone: source.contactPhone,
    contactEmail: source.contactEmail,
    discountDetails: source.offersDiscount ? source.discountDetails : null,
    locations: source.locations.map(toPublicLocation),
  }
}
