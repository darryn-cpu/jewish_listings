export const DINING_CATEGORIES = [
  ["restaurant", "Restaurant"],
  ["bakery", "Bakery"],
  ["caterer", "Caterer"],
  ["lodges-safaris-tours", "Lodges-Safaris-Tours"],
  ["supermarket", "Supermarket"],
  ["deli", "Deli"],
  ["take-away", "Take Away"],
  ["butchery", "Butchery"],
  ["coffee-shop", "Coffee Shop"],
  ["function-coordinator", "Function Coordinator"],
  ["fish-shop", "Fish Shop"],
  ["mobile-coffee-stall", "Mobile Coffee Stall"],
  ["mobile-pizza", "Mobile Pizza"],
  ["mobile-bars", "Mobile Bars"],
  ["mobile-ice-cream-bar", "Mobile ice cream bar"],
  ["old-age-home", "Old Age Home"],
  ["abattoir", "Abattoir"],
  ["mobile-sweet-bar", "Mobile Sweet Bar"],
  ["mobile-food-truck", "Mobile Food Truck"],
  ["mobile-braai", "Mobile Braai"],
  ["crockery-cutlery-hire", "Crockery/Cutlery Hire"],
  ["green-grocer", "Green Grocer"],
  ["ice-cream-shop", "Ice Cream shop"],
  ["liquor-store", "Liquor Store"],
  ["hospital-meals", "Hospital meals"],
  ["wedding-venues", "Wedding Venues"],
] as const

export const DINING_SLUGS = DINING_CATEGORIES.map(([slug]) => slug)

const CATEGORY_BY_SLUG = new Map<string, string>(DINING_CATEGORIES)

const CITY_NAME = {
  JOHANNESBURG: "Johannesburg",
  CAPE_TOWN: "Cape Town",
  OTHER: "Other",
} as const

export type DiningCity = (typeof CITY_NAME)[keyof typeof CITY_NAME]

export type DiningPhone = {
  disp: string
  tel: string
  label: string
  wa: boolean
}

export type DiningListing = {
  id: string
  name: string
  cats: string[]
  city: DiningCity
  place: string
  address: string
  phones: DiningPhone[]
  emails: string[]
  webs: string[]
  maps: string[]
  lat: number | null
  lng: number | null
  ig: string
  fb: string
  k: { p: boolean; d: boolean; c: boolean; m: boolean; h: boolean }
  notes: string
  line: string
  desc: string
  post: string
  i: number
}

type Numeric = { toString(): string } | number | null

export type DiningSource = {
  id: string
  legalName: string
  tradingName: string | null
  customDescription: string | null
  websiteUrl: string | null
  contactPhone: string
  contactEmail: string
  offersDiscount: boolean
  discountDetails: string | null
  reviewerNotes: string | null
  tags: { tag: { slug: string } }[]
  locations: {
    addressLine1: string | null
    addressLine2: string | null
    suburb: string
    city: keyof typeof CITY_NAME
    postalCode: string | null
    latitude: Numeric
    longitude: Numeric
    isPrimary: boolean
  }[]
  kosherCertification: {
    meat: boolean
    dairy: boolean
    chalavYisrael: boolean
    parev: boolean
    mehadrin: boolean
  } | null
}

function listed(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ""
  if (!trimmed || trimmed.toLowerCase() === "not supplied") return ""
  return trimmed
}

function digits(value: string) {
  return value.replace(/\D/g, "")
}

function addPhone(phones: DiningPhone[], display: string, whatsApp: boolean) {
  const disp = display.trim()
  const number = digits(disp)
  if (number.length < 9) return
  if (phones.some((phone) => digits(phone.disp) === number)) return
  const tel = disp.startsWith("+") ? `+${number}` : number
  phones.push({ disp, tel, label: "", wa: whatsApp })
}

function addEmail(emails: string[], value: string) {
  const email = value.trim()
  if (!email.includes("@") || /\s/.test(email)) return
  if (emails.some((item) => item.toLowerCase() === email.toLowerCase())) return
  emails.push(email)
}

function httpUrl(value: string) {
  const trimmed = value.trim()
  return /^https?:\/\/\S+$/i.test(trimmed) ? trimmed : ""
}

function addWeb(target: { webs: string[]; ig: string; fb: string }, value: string) {
  const url = httpUrl(value)
  if (!url) return
  if (/facebook\.com|fb\.com/i.test(url)) {
    if (!target.fb) target.fb = url
    return
  }
  if (/instagram\.com/i.test(url)) {
    if (!target.ig) target.ig = url
    return
  }
  if (!target.webs.includes(url)) target.webs.push(url)
}

function looksLikePhone(value: string) {
  return /^[+0-9][\d\s()-]+$/.test(value) && digits(value).length >= 9 && digits(value).length <= 15
}

function coordinate(value: Numeric) {
  if (value == null) return null
  const parsed = Number(value.toString())
  return Number.isFinite(parsed) ? parsed : null
}

function addressOf(location: DiningSource["locations"][number]) {
  const seen = new Set<string>()
  const parts = [
    location.addressLine1,
    location.addressLine2,
    location.suburb,
    CITY_NAME[location.city],
    location.postalCode,
  ]
  return parts.filter((part) => {
    const value = part?.trim()
    if (!value) return false
    const key = value.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).join(", ")
}

export function toDiningListing(source: DiningSource, index: number): DiningListing | null {
  const cats = source.tags.flatMap((entry) => {
    const category = CATEGORY_BY_SLUG.get(entry.tag.slug)
    return category ? [category] : []
  })
  if (!cats.length) return null

  const location = source.locations.find((item) => item.isPrimary) ?? source.locations[0]
  const city = location ? CITY_NAME[location.city] : "Johannesburg"
  const place = location?.suburb?.trim() || "Not listed"
  const phones: DiningPhone[] = []
  const emails: string[] = []
  const links = { webs: [] as string[], ig: "", fb: "" }
  const notes: string[] = []

  addPhone(phones, listed(source.contactPhone), false)
  addEmail(emails, listed(source.contactEmail))
  addWeb(links, source.websiteUrl ?? "")

  for (const part of (source.customDescription ?? "").split("|").map((item) => item.trim()).filter(Boolean)) {
    const whatsApp = /^whatsapp\s+/i.test(part)
    const rest = part.replace(/^whatsapp\s+/i, "").trim()
    if (whatsApp || looksLikePhone(rest)) {
      addPhone(phones, rest, whatsApp)
      continue
    }
    if (rest.includes("@") && !/\s/.test(rest)) {
      addEmail(emails, rest)
      continue
    }
    if (httpUrl(rest)) {
      addWeb(links, rest)
      continue
    }
    notes.push(part)
  }

  const note = notes.join(" | ")
  const lat = location ? coordinate(location.latitude) : null
  const lng = location ? coordinate(location.longitude) : null
  const kosher = source.kosherCertification
  const post = source.reviewerNotes?.match(/KosherSA post\s+([^.\s]+)/)?.[1] ?? ""

  return {
    id: source.id,
    name: source.tradingName?.trim() || source.legalName,
    cats,
    city,
    place,
    address: location ? addressOf(location) : "",
    phones,
    emails,
    webs: links.webs,
    maps: lat != null && lng != null ? [`https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`] : [],
    lat,
    lng,
    ig: links.ig,
    fb: links.fb,
    k: {
      p: kosher?.parev === true,
      d: kosher?.dairy === true,
      c: kosher?.chalavYisrael === true,
      m: kosher?.meat === true,
      h: kosher?.mehadrin === true,
    },
    notes: note,
    line: note.length > 0 && note.length <= 90 ? note : "",
    desc: source.offersDiscount ? listed(source.discountDetails) : "",
    post,
    i: index,
  }
}
