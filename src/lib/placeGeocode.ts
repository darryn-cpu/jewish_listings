import { geodesicKm } from "./nearest"

const CITY_NAME = {
  JOHANNESBURG: "Johannesburg",
  CAPE_TOWN: "Cape Town",
  OTHER: "",
} as const

const HUBS = {
  JOHANNESBURG: { lat: -26.2041, lng: 28.0473, maxKm: 90 },
  CAPE_TOWN: { lat: -33.9249, lng: 18.4241, maxKm: 120 },
} as const

const VAGUE = new Set(["", "not listed", "no address listed", "africa", "south africa", "johannesburg", "cape town", "other"])

export type PlaceQuery = {
  addressLine1: string | null
  suburb: string
  city: keyof typeof CITY_NAME
  postalCode: string | null
}

export type GeoHit = {
  lat: string
  lon: string
  display_name?: string
  address?: Record<string, string>
}

const LOCALITY_KEYS = ["suburb", "neighbourhood", "quarter", "village", "town", "city_district", "hamlet", "locality", "city", "municipality"]
const STOP_WORDS = new Set(["shopping", "centre", "center", "level", "mezzanine", "unit", "corner", "south", "africa", "johannesburg", "cape", "town", "road", "street", "avenue", "drive", "mall", "shop", "shops", "game", "private"])

function localityText(hit: GeoHit) {
  const address = hit.address ?? {}
  return LOCALITY_KEYS.map((key) => address[key] ?? "").join(" ").toLowerCase()
}

function streetTokens(place: PlaceQuery) {
  const suburbWords = new Set(clean(place.suburb).toLowerCase().split(/\W+/).filter(Boolean))
  return clean(place.addressLine1)
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length >= 5 && !STOP_WORDS.has(word) && !suburbWords.has(word) && !/^\d+$/.test(word))
}

export function hitMatchesPlace(hit: GeoHit, place: PlaceQuery) {
  const suburb = clean(place.suburb).toLowerCase()
  const city = CITY_NAME[place.city].toLowerCase()
  const suburbUseful = !VAGUE.has(suburb) && suburb !== city
  if (suburbUseful && localityText(hit).includes(suburb)) return true
  const road = `${hit.address?.road ?? ""} ${hit.display_name ?? ""}`.toLowerCase()
  return streetTokens(place).some((token) => road.includes(token))
}

function clean(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim()
}

function joinUnique(parts: string[]) {
  const seen = new Set<string>()
  return parts
    .filter((part) => {
      const value = part.trim()
      if (!value) return false
      const key = value.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .join(", ")
}

function streetNumber(line: string) {
  return line.match(/\b\d+\s+[^,]+/)?.[0].trim() ?? ""
}

export function geocodeQueries(place: PlaceQuery) {
  const city = CITY_NAME[place.city]
  const suburb = clean(place.suburb)
  const line = clean(place.addressLine1)
  const postal = clean(place.postalCode)
  const suburbUseful = !VAGUE.has(suburb.toLowerCase()) && suburb.toLowerCase() !== city.toLowerCase()
  const lineIsPlace =
    line.toLowerCase() === suburb.toLowerCase() ||
    line.toLowerCase() === `${suburb}, ${city}`.toLowerCase() ||
    line.toLowerCase() === city.toLowerCase()
  const lineUseful = line.length > 0 && !VAGUE.has(line.toLowerCase()) && !lineIsPlace
  const queries: string[] = []
  if (lineUseful) {
    queries.push(joinUnique([line, suburbUseful ? suburb : "", city, postal, "South Africa"]))
    const numbered = streetNumber(line)
    if (numbered && numbered.toLowerCase() !== line.toLowerCase()) {
      queries.push(joinUnique([numbered, suburbUseful ? suburb : "", city, postal, "South Africa"]))
    }
  }
  if (suburbUseful) queries.push(joinUnique([suburb, city, postal, "South Africa"]))
  return [...new Set(queries)]
}

function inSouthAfrica(lat: number, lng: number) {
  return lat >= -35.2 && lat <= -22 && lng >= 16 && lng <= 33.2
}

function round6(value: number) {
  return Math.round(value * 1e6) / 1e6
}

export function chooseHit(hits: GeoHit[], place: PlaceQuery) {
  const hub = place.city === "OTHER" ? null : HUBS[place.city]
  for (const hit of hits) {
    const lat = Number(hit.lat)
    const lng = Number(hit.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    if (!inSouthAfrica(lat, lng)) continue
    if (hub && geodesicKm(hub.lat, hub.lng, lat, lng) > hub.maxKm) continue
    if (!hitMatchesPlace(hit, place)) continue
    return { lat: round6(lat), lng: round6(lng) }
  }
  return null
}
