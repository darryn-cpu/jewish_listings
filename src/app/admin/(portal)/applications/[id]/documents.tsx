import { Spinner } from "@/components/spinner"
import { loadApplicationDocuments } from "@/server/adminService"

export function DocumentsFallback() {
  return (
    <section className="stack" aria-busy="true" aria-live="polite">
      <article className="panel doc">
        <p className="loading-label"><Spinner /> Opening documents</p>
        <div className="skel doc" />
      </article>
    </section>
  )
}

export async function ApplicationDocuments({
  slots,
}: {
  slots: Array<{ purpose: string; label: string; objectKey: string | null }>
}) {
  const documents = await loadApplicationDocuments(slots)
  if (!documents.length) return null

  return (
    <section className="stack">
      {documents.map((document) => (
        <article className="panel doc" key={document.purpose}>
          <h2>{document.label}</h2>
          {document.url && document.mimeType.startsWith("image/") ? <img src={document.url} alt="" /> : null}
          {document.url && document.mimeType === "application/pdf" ? <iframe src={document.url} title={document.label} /> : null}
          {document.url ? <a className="btn small" href={document.url} target="_blank" rel="noopener noreferrer">Open document</a> : <p className="alert">The document link is unavailable.</p>}
        </article>
      ))}
    </section>
  )
}
