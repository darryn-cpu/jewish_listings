import Link from "next/link"
import { ApplyForm } from "./apply-form"
import { one } from "@/lib/directory"
import { STATUS_LABEL } from "@/lib/labels"
import { lookupApplicationStatus } from "@/server/adminService"
import { getMetadata } from "@/server/metadataService"

export const dynamic = "force-dynamic"
export const metadata = { title: "Apply" }

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const ref = one(raw.ref)?.trim() ?? ""
  const token = one(raw.token)?.trim() ?? ""
  const view = one(raw.view) === "status" || Boolean(ref || token) ? "status" : "apply"
  const result = view === "status" && ref && token ? await lookupApplicationStatus(ref, token) : null
  const checked = view === "status" && Boolean(ref && token)
  const directory = view === "apply" ? await getMetadata() : null

  return (
    <main className="page">
      <div className="row">
        <Link className={view === "apply" ? "btn-primary" : "btn"} href="/apply">Apply</Link>
        <Link className={view === "status" ? "btn-primary" : "btn"} href="/apply?view=status">Check status</Link>
      </div>
      {view === "apply" && directory ? (
        <>
          <div>
            <p className="kicker">Foundation 2000</p>
            <h1>Apply for the directory</h1>
            <p className="lede">Six short steps. Documents stay private, and the listing is published only after review.</p>
          </div>
          <ApplyForm metadata={directory} />
        </>
      ) : (
        <>
          <div>
            <p className="kicker">No account needed</p>
            <h1>Check an application</h1>
            <p className="lede">Use the reference and the private token from the receipt.</p>
          </div>
          <form className="panel" action="/apply" method="get">
            <input type="hidden" name="view" value="status" />
            <label className="field"><span>Reference</span><input name="ref" defaultValue={ref} placeholder="JBD-2026-0001" /></label>
            <label className="field"><span>Status token</span><input name="token" defaultValue={token} /></label>
            <button className="btn-primary" type="submit">Look up</button>
          </form>
          {checked && result ? (
            <section className="panel">
              <p className="kicker">{result.refCode}</p>
              <h2 className={`status status-${result.status}`}>{STATUS_LABEL[result.status]}</h2>
              <p className="muted">Updated {new Date(result.updatedAt).toLocaleString("en-ZA")}</p>
            </section>
          ) : null}
          {checked && !result ? <p className="alert">No application matches that reference and token.</p> : null}
        </>
      )}
    </main>
  )
}
