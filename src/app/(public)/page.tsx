import type { Metadata } from "next"
import { DiningApp } from "@/components/dining/dining-app"
import { one } from "@/lib/directory"
import { listDiningCatalog } from "@/server/diningCatalog"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: { absolute: "Jewish Yellow Pages — Shopping & Dining" },
  description: "Kosher shopping and dining in South Africa. Restaurants, bakeries, caterers, markets and lodges.",
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const listing = one((await searchParams).listing)
  try {
    const listings = await listDiningCatalog()
    return <DiningApp listings={listings} initialId={listing} />
  } catch (error) {
    console.error(error)
    return <DiningApp listings={[]} error="The directory could not be loaded." />
  }
}
