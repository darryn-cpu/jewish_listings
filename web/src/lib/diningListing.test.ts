import { describe, expect, it } from "vitest"
import { toDiningListing, type DiningSource } from "@/lib/diningListing"

function source(overrides: Partial<DiningSource> = {}): DiningSource {
  return {
    id: "biz-1",
    legalName: "18 On The Hill",
    tradingName: null,
    customDescription: "By prior arrangement | WhatsApp +27 66 336 7220 | https://facebook.com/example",
    websiteUrl: "https://18onthehill.com",
    contactPhone: "+27109000018",
    contactEmail: "res@18onthehill.com",
    offersDiscount: false,
    discountDetails: null,
    reviewerNotes: "KosherSA post 8818. Imported from the KosherSA shopping and dining spreadsheet.",
    tags: [{ tag: { slug: "lodges-safaris-tours" } }, { tag: { slug: "legal" } }],
    locations: [
      {
        addressLine1: "Greater Kruger",
        addressLine2: null,
        suburb: "Greater Kruger",
        city: "OTHER",
        postalCode: null,
        latitude: null,
        longitude: null,
        isPrimary: true,
      },
    ],
    kosherCertification: {
      meat: false,
      dairy: true,
      chalavYisrael: false,
      parev: false,
      mehadrin: true,
    },
    ...overrides,
  }
}

describe("dining listings", () => {
  it("maps an imported KosherSA row into the phone directory shape", () => {
    const listing = toDiningListing(source(), 4)
    expect(listing).toMatchObject({
      id: "biz-1",
      name: "18 On The Hill",
      cats: ["Lodges-Safaris-Tours"],
      city: "Other",
      place: "Greater Kruger",
      address: "Greater Kruger, Other",
      phones: [
        { disp: "+27109000018", tel: "+27109000018", label: "", wa: false },
        { disp: "+27 66 336 7220", tel: "+27663367220", label: "", wa: true },
      ],
      emails: ["res@18onthehill.com"],
      webs: ["https://18onthehill.com"],
      fb: "https://facebook.com/example",
      notes: "By prior arrangement",
      line: "By prior arrangement",
      post: "8818",
      i: 4,
      k: { p: false, d: true, c: false, m: false, h: true },
    })
  })

  it("leaves out businesses that are not shopping or dining", () => {
    expect(toDiningListing(source({ tags: [{ tag: { slug: "legal" } }] }), 0)).toBeNull()
  })

  it("hides placeholder contact details", () => {
    const listing = toDiningListing(source({
      contactPhone: "Not supplied",
      contactEmail: "Not supplied",
      customDescription: "Boiled bagels.",
      websiteUrl: null,
    }), 0)
    expect(listing?.phones).toEqual([])
    expect(listing?.emails).toEqual([])
    expect(listing?.notes).toBe("Boiled bagels.")
  })
})
