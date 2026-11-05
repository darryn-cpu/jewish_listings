export const FOOD_TAG_SLUGS = [
  "restaurant",
  "bakery",
  "caterer",
  "supermarket",
  "deli",
  "take-away",
  "butchery",
  "coffee-shop",
  "fish-shop",
  "mobile-coffee-stall",
  "mobile-pizza",
  "mobile-bars",
  "mobile-ice-cream-bar",
  "abattoir",
  "mobile-sweet-bar",
  "mobile-food-truck",
  "mobile-braai",
  "green-grocer",
  "ice-cream-shop",
  "hospital-meals",
] as const

export const FOOD_TYPE_MESSAGE = "Choose meat, dairy, parev, Chalav Yisrael, or mehadrin."

export const MARKS_ONLY_CERT_KEY = "application/kashrut-marks"

const foodTagSlugs = new Set<string>(FOOD_TAG_SLUGS)

export function needsFoodType(tagSlugs: Iterable<string>) {
  for (const slug of tagSlugs) {
    if (foodTagSlugs.has(slug)) return true
  }
  return false
}

export function hasFoodType(marks: {
  meat?: boolean
  dairy?: boolean
  chalavYisrael?: boolean
  parev?: boolean
  mehadrin?: boolean
} | null | undefined) {
  return Boolean(marks?.meat || marks?.dairy || marks?.chalavYisrael || marks?.parev || marks?.mehadrin)
}

export function isApplicantDocument(objectKey: string | null | undefined): objectKey is string {
  return Boolean(objectKey && !objectKey.startsWith("import/koshersa/") && objectKey !== MARKS_ONLY_CERT_KEY)
}
