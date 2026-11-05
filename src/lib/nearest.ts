const EARTH_RADIUS_KM = 6371

export type GeoPoint = {
  lat: number | null
  lng: number | null
}

export function geodesicKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)))
}

export function formatKmAway(km: number) {
  return `${(Math.round(km * 10) / 10).toFixed(1)} KM AWAY`
}

export function closestByGeodesic<T extends GeoPoint>(items: T[], lat: number, lng: number, limit = 5) {
  return items
    .flatMap((item) => {
      if (item.lat == null || item.lng == null) return []
      return [{ item, km: geodesicKm(lat, lng, item.lat, item.lng) }]
    })
    .sort((a, b) => a.km - b.km)
    .slice(0, limit)
}
