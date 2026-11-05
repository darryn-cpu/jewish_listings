import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { FORMAT_LABEL, MODEL_LABEL } from "@/lib/labels"
import { isPublishedDiningListing } from "@/server/diningCatalog"
import { getApprovedBusiness } from "@/server/directoryService"

export const dynamic = "force-dynamic"

const KASHRUT = [
  ["meat", "Meat"],
  ["dairy", "Dairy"],
  ["chalavYisrael", "Chalav Yisrael"],
  ["parev", "Parev"],
  ["mehadrin", "Mehadrin"],
] as const

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (await isPublishedDiningListing(id)) redirect(`/?listing=${encodeURIComponent(id)}`)
  const business = await getApprovedBusiness(id)
  if (!business) notFound()
  const marks = business.kosher ? KASHRUT.filter(([key]) => business.kosher?.[key]) : []
  const phone = listedValue(business.contactPhone)
  const email = business.contactEmail.includes("@") ? listedValue(business.contactEmail) : null
  const recordedCertificate = business.kosher != null && business.kosher.bethDinCertNumber !== "Not supplied"

  return (
    <main className="page">
      <Link className="text-link" href="/">Back to the directory</Link>
      <header>
        <p className="kicker">{business.cityLabel}</p>
        <h1>{business.name}</h1>
        {business.tradingName ? <p className="muted">{business.legalName}</p> : null}
      </header>
      <section className="panel">
        <div className="chips">
          {business.isTest ? <span className="status status-test">Test</span> : null}
          <span className="chip">{business.industry.name}</span>
          <span className="chip">{MODEL_LABEL[business.businessModel]}</span>
          <span className="chip">{FORMAT_LABEL[business.operationalFormat]}</span>
          {business.tags.map((tag) => <span className="chip" key={tag.slug}>{tag.name}</span>)}
        </div>
        {business.description ? <p>{business.description}</p> : null}
        {business.offersDiscount && business.discountDetails ? <p className="ok-note">{business.discountDetails}</p> : null}
      </section>
      <section className="panel">
        <h2>Contact</h2>
        <p>{business.contactName}</p>
        {phone ? <p><a href={`tel:${phone}`}>{phone}</a></p> : null}
        {email ? <p><a href={`mailto:${email}`}>{email}</a></p> : null}
        {business.websiteUrl ? <p><a href={business.websiteUrl} rel="noopener noreferrer">{business.websiteUrl}</a></p> : null}
      </section>
      <section className="stack">
        {business.locations.map((location) => (
          <article className="panel" key={location.id}>
            <h2>{location.branchName || (location.isPrimary ? "Primary branch" : "Branch")}</h2>
            <p>{[location.addressLine1, location.addressLine2, location.suburb, location.cityLabel, location.postalCode].filter(Boolean).join(", ")}</p>
          </article>
        ))}
      </section>
      {business.kosher ? (
        <section className="panel">
          <h2>Kosher</h2>
          {recordedCertificate ? <p>{business.kosher.brandName}</p> : null}
          {recordedCertificate ? <p className="muted">Beth Din {business.kosher.bethDinCertNumber}</p> : null}
          <div className="chips">
            {marks.map(([, label]) => <span className="chip kosher" key={label}>{label}</span>)}
            {business.kosher.allowsBulkOrdering ? <span className="chip">Wholesale and bulk</span> : null}
          </div>
        </section>
      ) : null}
    </main>
  )
}

function listedValue(value: string) {
  const trimmed = value.trim()
  if (!trimmed || trimmed.toLowerCase() === "not supplied") return null
  return trimmed
}
