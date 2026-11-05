import Link from "next/link"
import { StaffForm } from "./staff-form"
import { one } from "@/lib/directory"
import { CITY_LABEL, STATUS_LABEL, type CityCode, type StatusCode } from "@/lib/labels"
import { getStats, listQueue, parseQueueQuery } from "@/server/adminService"
import { getSession } from "@/server/session"

export const dynamic = "force-dynamic"
export const metadata = { title: "Review queue" }

export default async function QueuePage({
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
  const [stats, queue, session] = await Promise.all([
    getStats(),
    listQueue(parseQueueQuery(params)),
    getSession(),
  ])
  const cards = [
    ["Applications", stats.total],
    ["Pending", stats.pending],
    ["Approved", stats.approved],
    ["Needs info", stats.requiresInfo],
    ["Johannesburg", stats.johannesburg],
    ["Cape Town", stats.capeTown],
    ["Kosher", stats.kosher],
    ["Rejected", stats.rejected],
  ]

  return (
    <main className="page">
      <div>
        <p className="kicker">Foundation 2000</p>
        <h1>Review queue</h1>
      </div>
      <section className="stats">
        {cards.map(([label, value]) => (
          <article className="stat" key={label}>
            <span className="tiny">{label}</span>
            <b>{value}</b>
          </article>
        ))}
      </section>
      <form className="panel" action="/admin" method="get">
        <label className="field"><span>Search</span><input name="q" defaultValue={params.get("q") ?? ""} placeholder="Name or reference" /></label>
        <div className="form-grid two">
          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue={params.get("status") ?? ""}>
              <option value="">All</option>
              {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Date</span>
            <select name="sort" defaultValue={params.get("sort") ?? "desc"}>
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>
        </div>
        <button className="btn-primary" type="submit">Filter</button>
      </form>
      <section className="stack">
        {queue.results.map((item) => (
          <Link className="card" href={`/admin/applications/${item.id}`} key={item.id}>
            <div className="split">
              <h2>{item.tradingName || item.legalName}</h2>
              <span className="chips">
                {item.isTest ? <span className="status status-test">Test</span> : null}
                <span className={`status status-${item.status}`}>{STATUS_LABEL[item.status as StatusCode]}</span>
              </span>
            </div>
            <p className="muted">{item.refCode} · {item.city ? CITY_LABEL[item.city as CityCode] : "No city"}{item.suburb ? ` · ${item.suburb}` : ""}</p>
            <p className="tiny">{new Date(item.createdAt).toLocaleString("en-ZA")}</p>
          </Link>
        ))}
        {queue.results.length === 0 ? <p className="empty">No applications match this filter.</p> : null}
      </section>
      {session?.role === "SUPERADMIN" ? <StaffForm /> : null}
    </main>
  )
}
