import Link from "next/link"
import { DirectoryFilters } from "@/components/directory-filters"
import { one } from "@/lib/directory"
import { MODEL_LABEL } from "@/lib/labels"
import { ApiError } from "@/server/errors"
import { listDirectory } from "@/server/directoryService"
import { getMetadata } from "@/server/metadataService"
import { parseDirectoryQuery } from "@/server/schemas"

export const dynamic = "force-dynamic"

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(raw)) {
    const item = one(value)
    if (item) params.set(key, item)
  }
  const metadata = await getMetadata()
  let message: string | null = null
  let directory = { page: 1, limit: 20, total: 0, results: [] as Awaited<ReturnType<typeof listDirectory>>["results"] }
  try {
    directory = await listDirectory(parseDirectoryQuery(params))
  } catch (error) {
    message = error instanceof ApiError ? error.message : "The directory could not be loaded."
  }

  return (
    <main className="page">
      <div>
        <p className="kicker">Johannesburg · Cape Town</p>
        <h1>Find a Jewish-owned business</h1>
        <p className="lede">Approved listings from Foundation 2000. Applications stay private until a reviewer publishes them.</p>
      </div>
      <DirectoryFilters
        metadata={metadata}
        initial={{
          search: params.get("search") ?? "",
          city: params.get("city") ?? "",
          category: params.get("category") ?? "",
          b2b: params.get("b2b") === "true",
          b2c: params.get("b2c") === "true",
          kosherOnly: params.get("kosherOnly") === "true",
          lat: params.get("lat") ?? "",
          lng: params.get("lng") ?? "",
          radiusKm: params.get("radiusKm") ?? "",
        }}
      />
      {message ? <p className="alert">{message}</p> : null}
      <p className="muted">{directory.total} approved {directory.total === 1 ? "business" : "businesses"}</p>
      <section className="stack">
        {directory.results.map((business) => (
          <Link className="card" key={business.id} href={`/business/${business.id}`}>
            <div className="split">
              <h2>{business.name}</h2>
              {business.distanceKm != null ? <span className="tiny">{business.distanceKm.toFixed(1)} km</span> : null}
            </div>
            <p className="muted">{business.suburb} · {business.cityLabel}</p>
            {business.description ? <p>{business.description}</p> : null}
            <div className="chips">
              {business.isTest ? <span className="status status-test">Test</span> : null}
              <span className="chip">{business.industry.name}</span>
              <span className="chip">{MODEL_LABEL[business.businessModel]}</span>
              {business.kosher ? <span className="chip kosher">Kosher</span> : null}
              {business.offersDiscount ? <span className="chip">Community discount</span> : null}
            </div>
          </Link>
        ))}
        {directory.results.length === 0 && !message ? <p className="panel">No approved businesses match these filters yet.</p> : null}
      </section>
    </main>
  )
}
