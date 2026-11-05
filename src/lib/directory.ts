import type { CityCode } from "@/lib/labels"

export type DirectoryMetadata = {
  cities: { id: CityCode; label: string }[]
  industries: {
    id: string
    slug: string
    name: string
    tags: { id: string; slug: string; name: string }[]
  }[]
  synagogues: { id: string; name: string; city: CityCode; rabbiName: string | null }[]
}

export function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
