export type CityCode = "JOHANNESBURG" | "CAPE_TOWN"

export type IndustrySeed = {
  slug: string
  name: string
  sortOrder: number
  tags: { slug: string; name: string }[]
}

export type SynagogueSeed = {
  name: string
  city: CityCode
}

function tag(slug: string, name: string) {
  return { slug, name }
}

const foodTags = [
  tag("restaurant", "Restaurants"),
  tag("bakery", "Bakeries"),
  tag("caterer", "Caterers"),
  tag("lodges-safaris-tours", "Lodges & safaris"),
  tag("supermarket", "Supermarkets"),
  tag("deli", "Delis"),
  tag("take-away", "Takeaways"),
  tag("butchery", "Butcheries"),
  tag("coffee-shop", "Coffee shops"),
  tag("function-coordinator", "Function coordinators"),
  tag("fish-shop", "Fish shops"),
  tag("mobile-coffee-stall", "Mobile coffee"),
  tag("mobile-pizza", "Mobile pizza"),
  tag("mobile-bars", "Mobile bars"),
  tag("mobile-ice-cream-bar", "Mobile ice cream"),
  tag("old-age-home", "Old age homes"),
  tag("abattoir", "Abattoirs"),
  tag("mobile-sweet-bar", "Mobile sweets"),
  tag("mobile-food-truck", "Food trucks"),
  tag("mobile-braai", "Mobile braai"),
  tag("crockery-cutlery-hire", "Crockery & cutlery"),
  tag("green-grocer", "Green grocer"),
  tag("ice-cream-shop", "Ice cream"),
  tag("liquor-store", "Liquor"),
  tag("hospital-meals", "Hospital meals"),
  tag("wedding-venues", "Wedding venues"),
]

export const industries: IndustrySeed[] = [
  {
    slug: "food-hospitality",
    name: "Kosher food and hospitality",
    sortOrder: 10,
    tags: foodTags,
  },
  {
    slug: "professional-services",
    name: "Professional services",
    sortOrder: 20,
    tags: [
      tag("legal", "Legal"),
      tag("accounting", "Accounting"),
      tag("medical", "Medical"),
      tag("dental", "Dental"),
      tag("financial-advice", "Financial advice"),
    ],
  },
  {
    slug: "property-construction",
    name: "Property and construction",
    sortOrder: 30,
    tags: [
      tag("estate-agency", "Estate agency"),
      tag("property-management", "Property management"),
      tag("architecture", "Architecture"),
      tag("building", "Building"),
    ],
  },
  {
    slug: "retail-trade",
    name: "Retail and trade",
    sortOrder: 40,
    tags: [
      tag("clothing", "Clothing"),
      tag("homeware", "Homeware"),
      tag("wholesale", "Wholesale"),
    ],
  },
  {
    slug: "education-community",
    name: "Education and community",
    sortOrder: 50,
    tags: [
      tag("school", "School"),
      tag("tutoring", "Tutoring"),
      tag("community-organisation", "Community organisation"),
    ],
  },
  {
    slug: "technology-media",
    name: "Technology and media",
    sortOrder: 60,
    tags: [
      tag("software", "Software"),
      tag("design", "Design"),
      tag("marketing", "Marketing"),
    ],
  },
  {
    slug: "home-personal",
    name: "Home and personal services",
    sortOrder: 70,
    tags: [
      tag("cleaning", "Cleaning"),
      tag("repairs", "Repairs"),
      tag("beauty", "Beauty"),
      tag("transport", "Transport"),
    ],
  },
]

export const synagogues: SynagogueSeed[] = [
  { name: "Great Park Synagogue", city: "JOHANNESBURG" },
  { name: "Oxford Shul", city: "JOHANNESBURG" },
  { name: "Sandton Shul", city: "JOHANNESBURG" },
  { name: "Sydenham-Highlands North Hebrew Congregation", city: "JOHANNESBURG" },
  { name: "Waverley Shul", city: "JOHANNESBURG" },
  { name: "Linksfield Senderwood Hebrew Congregation", city: "JOHANNESBURG" },
  { name: "Pine Street Shul", city: "JOHANNESBURG" },
  { name: "Greenside Shul", city: "JOHANNESBURG" },
  { name: "Ohr Somayach Savoy", city: "JOHANNESBURG" },
  { name: "Chabad of Strathavon", city: "JOHANNESBURG" },
  { name: "Chabad of Sandton", city: "JOHANNESBURG" },
  { name: "Gardens Shul", city: "CAPE_TOWN" },
  { name: "Sea Point Hebrew Congregation", city: "CAPE_TOWN" },
  { name: "Marais Road Shul", city: "CAPE_TOWN" },
  { name: "Claremont Wynberg Hebrew Congregation", city: "CAPE_TOWN" },
  { name: "Camps Bay Shul", city: "CAPE_TOWN" },
  { name: "Constantia Hebrew Congregation", city: "CAPE_TOWN" },
  { name: "Milnerton Shul", city: "CAPE_TOWN" },
  { name: "Chabad of Cape Town", city: "CAPE_TOWN" },
]
