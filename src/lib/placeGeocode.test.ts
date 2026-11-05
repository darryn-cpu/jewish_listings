import { describe, expect, it } from "vitest"
import { chooseHit, geocodeQueries } from "@/lib/placeGeocode"

describe("place geocoding", () => {
  it("searches a street address, then the suburb", () => {
    expect(geocodeQueries({
      addressLine1: "15 Northfield Avenue Glenhazel Johannesburg",
      suburb: "Glenhazel",
      city: "JOHANNESBURG",
      postalCode: null,
    })).toEqual([
      "15 Northfield Avenue Glenhazel Johannesburg, Glenhazel, Johannesburg, South Africa",
      "Glenhazel, Johannesburg, South Africa",
    ])
  })

  it("drops a shopping-centre prefix and keeps the street number", () => {
    expect(geocodeQueries({
      addressLine1: "Mezzanine Level, Genesis Shopping Centre, 10 Sandler Road, Fairmount",
      suburb: "Fairmount",
      city: "JOHANNESBURG",
      postalCode: "2192",
    })[1]).toBe("10 Sandler Road, Fairmount, Johannesburg, 2192, South Africa")
  })

  it("does not invent a pin for a city-only listing", () => {
    expect(geocodeQueries({
      addressLine1: null,
      suburb: "Johannesburg",
      city: "JOHANNESBURG",
      postalCode: null,
    })).toEqual([])
  })

  it("keeps a hit inside the listing city and rejects one in another city", () => {
    const place = {
      addressLine1: "15 Northfield Avenue",
      suburb: "Glenhazel",
      city: "JOHANNESBURG" as const,
      postalCode: null,
    }
    expect(chooseHit([
      { lat: "-33.9249", lon: "18.4241", address: { suburb: "Sea Point", city: "Cape Town" } },
      { lat: "-26.145", lon: "28.088", address: { road: "Northfield Avenue", suburb: "Glenhazel", city: "Johannesburg" } },
    ], place)).toEqual({ lat: -26.145, lng: 28.088 })
  })

  it("rejects a street that only shares the place name", () => {
    expect(chooseHit([{
      lat: "-25.841352",
      lon: "28.294406",
      display_name: "Sabi Sand Crescent, Meadow Heights, Pretoria, South Africa",
      address: { road: "Sabi Sand Crescent", suburb: "Meadow Heights", city: "Pretoria" },
    }], {
      addressLine1: "Sabi Sand Game Reserve S36",
      suburb: "Sabi Sand",
      city: "OTHER",
      postalCode: null,
    })).toBeNull()
  })

  it("keeps a road pin when the mapped suburb name differs", () => {
    expect(chooseHit([{
      lat: "-26.148742",
      lon: "28.099036",
      display_name: "Sandler Road, Sandringham, Johannesburg, South Africa",
      address: { road: "Sandler Road", suburb: "Sandringham", city: "Johannesburg" },
    }], {
      addressLine1: "Mezzanine Level, Genesis Shopping Centre, 10 Sandler Road, Fairmount",
      suburb: "Fairmount",
      city: "JOHANNESBURG",
      postalCode: "2192",
    })).toEqual({ lat: -26.148742, lng: 28.099036 })
  })
})
