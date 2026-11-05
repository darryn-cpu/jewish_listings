import { describe, expect, it } from "vitest"
import { closestByGeodesic, formatKmAway, geodesicKm } from "@/lib/nearest"

describe("nearest listings", () => {
  it("formats a geodesic distance for the closest badge", () => {
    expect(formatKmAway(1.36)).toBe("1.4 KM AWAY")
    expect(formatKmAway(0)).toBe("0.0 KM AWAY")
  })

  it("ranks only listings with coordinates and keeps the closest five", () => {
    const origin = { lat: -26.2041, lng: 28.0473 }
    const listings = [
      { id: "far", lat: -33.9249, lng: 18.4241 },
      { id: "none", lat: null, lng: null },
      { id: "near", lat: -26.21, lng: 28.05 },
      { id: "mid", lat: -26.25, lng: 28.08 },
      { id: "a", lat: -26.3, lng: 28.1 },
      { id: "b", lat: -26.4, lng: 28.2 },
      { id: "c", lat: -26.5, lng: 28.3 },
    ]
    const ranked = closestByGeodesic(listings, origin.lat, origin.lng)
    expect(ranked.map((row) => row.item.id)).toEqual(["near", "mid", "a", "b", "c"])
    expect(ranked[0].km).toBeCloseTo(geodesicKm(origin.lat, origin.lng, -26.21, 28.05), 6)
    expect(ranked[0].km).toBeLessThan(ranked[1].km)
  })
})
