import Link from "next/link"
import { notFound } from "next/navigation"
import { ReviewActions } from "./review-actions"
import { CITY_LABEL, FORMAT_LABEL, MODEL_LABEL, REASON_LABEL, REGISTRATION_LABEL, STATUS_LABEL } from "@/lib/labels"
import { getAdminApplication } from "@/server/adminService"

export const dynamic = "force-dynamic"

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const application = await getAdminApplication(id)
  if (!application) notFound()

  return (
    <main className="page">
      <Link className="text-link" href="/admin">Back to the queue</Link>
      <header className="split">
        <div>
          <p className="kicker">{application.refCode}</p>
          <h1>{application.tradingName || application.legalName}</h1>
          <p className="muted">{application.legalName}</p>
        </div>
        <span className="chips">
          {application.isTest ? <span className="status status-test">Test</span> : null}
          <span className={`status status-${application.status}`}>{STATUS_LABEL[application.status]}</span>
        </span>
      </header>

      <section className="panel">
        <h2>Business identity</h2>
        <p>{REGISTRATION_LABEL[application.registrationType]}</p>
        {application.cipcNumber ? <p>CIPC {application.cipcNumber}</p> : null}
        <p>{MODEL_LABEL[application.businessModel]} · {FORMAT_LABEL[application.operationalFormat]}</p>
        {application.websiteUrl ? <p><a href={application.websiteUrl}>{application.websiteUrl}</a></p> : null}
        <p>{application.contactName}</p>
        <p><a href={`tel:${application.contactPhone}`}>{application.contactPhone}</a></p>
        <p><a href={`mailto:${application.contactEmail}`}>{application.contactEmail}</a></p>
        <p>{application.industry.name}</p>
        <div className="chips">{application.tags.map((entry) => <span className="chip" key={entry.tagId}>{entry.tag.name}</span>)}</div>
        {application.customDescription ? <p>{application.customDescription}</p> : null}
      </section>

      <section className="stack">
        {application.locations.map((location) => (
          <article className="panel" key={location.id}>
            <h2>{location.branchName || (location.isPrimary ? "Primary branch" : "Branch")}</h2>
            <p>{[location.addressLine1, location.addressLine2, location.suburb, CITY_LABEL[location.city], location.postalCode].filter(Boolean).join(", ")}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>Jewish ownership</h2>
        <p>{application.jewishOwnershipPercentage}% Jewish ownership</p>
        <p>{application.synagogue?.name || application.synagogueOtherName}</p>
        <p>{application.rabbiContactName}</p>
        <p><a href={`tel:${application.rabbiContactPhone}`}>Call {application.rabbiContactPhone}</a></p>
      </section>

      {application.kosherCertification ? (
        <section className="panel">
          <h2>Kosher brand</h2>
          <p>{application.kosherCertification.brandName}</p>
          <p>Beth Din {application.kosherCertification.bethDinCertNumber}</p>
          <p>{application.kosherCertification.allowsBulkOrdering ? "Offers wholesale or bulk purchasing" : "No bulk purchasing"}</p>
        </section>
      ) : null}

      <section className="panel">
        <h2>Community offer</h2>
        <p>{application.offersDiscount ? application.discountDetails : "No community discount"}</p>
        <p className="tiny">Publishing consent: {application.consentAccepted ? "yes" : "no"} · Accuracy declaration: {application.accuracyDeclared ? "yes" : "no"}</p>
        {application.reviewerNotes ? <p>Internal note: {application.reviewerNotes}</p> : null}
        {application.rejectionReason ? <p>Rejection reason: {REASON_LABEL[application.rejectionReason]}</p> : null}
      </section>

      <section className="stack">
        {application.documents.map((document) => (
          <article className="panel doc" key={document.purpose}>
            <h2>{document.label}</h2>
            {document.url && document.mimeType.startsWith("image/") ? <img src={document.url} alt="" /> : null}
            {document.url && document.mimeType === "application/pdf" ? <iframe src={document.url} title={document.label} /> : null}
            {document.url ? <a href={document.url}>Open document</a> : <p className="alert">The document link is unavailable.</p>}
          </article>
        ))}
      </section>

      <ReviewActions id={application.id} />

      <section className="panel audit">
        <h2>Audit trail</h2>
        {application.auditLogs.length === 0 ? <p className="muted">No status changes yet.</p> : null}
        {application.auditLogs.map((entry) => (
          <article key={entry.id}>
            <p><strong>{STATUS_LABEL[entry.previousStatus]}</strong> to <strong>{STATUS_LABEL[entry.newStatus]}</strong></p>
            <p className="tiny">{entry.adminEmail} · {new Date(entry.timestamp).toLocaleString("en-ZA")}</p>
            {entry.reasonCode ? <p>{REASON_LABEL[entry.reasonCode]}</p> : null}
            {entry.comment ? <p>{entry.comment}</p> : null}
          </article>
        ))}
      </section>
    </main>
  )
}
