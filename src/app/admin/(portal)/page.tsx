import Link from "next/link"
import { StaffForm } from "./staff-form"
import { LinkPending } from "@/components/link-pending"
import { NavForm, NavSubmit } from "@/components/nav-form"
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
  const activeStatus = params.get("status") ?? ""
  const cards: Array<{ label: string; value: number; status?: string }> = [
    { label: "Applications", value: stats.total, status: "" },
    { label: "Pending", value: stats.pending, status: "PENDING_REVIEW" },
    { label: "Approved", value: stats.approved, status: "APPROVED" },
    { label: "Disabled", value: stats.disabled, status: "DISABLED" },
    { label: "Needs info", value: stats.requiresInfo, status: "REQUIRES_INFO" },
    { label: "Johannesburg", value: stats.johannesburg },
    { label: "Cape Town", value: stats.capeTown },
    { label: "Kosher", value: stats.kosher },
    { label: "Rejected", value: stats.rejected, status: "REJECTED" },
  ]

  function filterHref(status: string) {
    const next = new URLSearchParams(params)
    next.delete("page")
    if (status) next.set("status", status)
    else next.delete("status")
    const query = next.toString()
    return query ? `/admin?${query}` : "/admin"
  }

  return (
    <main className="page">
      <div>
        <p className="kicker">Foundation 2000</p>
        <h1>Review queue</h1>
      </div>
      <section className="stats">
        {cards.map((card) => {
          if (card.status === undefined) {
            return (
              <article className="stat" key={card.label}>
                <span className="tiny">{card.label}</span>
                <b>{card.value}</b>
              </article>
            )
          }
          const active = activeStatus === card.status
          return (
            <Link
              className={active ? "stat is-active" : "stat"}
              href={filterHref(card.status)}
              key={card.label}
              aria-current={active ? "true" : undefined}
            >
              <span className="tiny">{card.label}</span>
              <b>{card.value}</b>
              <LinkPending overlay label="Filtering" />
            </Link>
          )
        })}
      </section>
      <NavForm key={params.toString()} className="panel" action="/admin" current={params.toString()}>
        <label className="field"><span>Search</span><input name="q" defaultValue={params.get("q") ?? ""} placeholder="Name or reference" /></label>
        <div className="form-grid two">
          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue={params.get("status") ?? ""}>
              <option value="">All</option>
              {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              <option value="DISABLED">Disabled</option>
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
        <NavSubmit idle="Filter" busy="Filtering" />
      </NavForm>
      <section className="stack">
        {queue.results.map((item) => (
          <Link className="card" href={`/admin/applications/${item.id}`} key={item.id}>
            <div className="split">
              <h2>{item.tradingName || item.legalName}</h2>
              <span className="chips">
                {item.isTest ? <span className="status status-test">Test</span> : null}
                {item.disabledAt ? <span className="status status-disabled">Disabled</span> : null}
                <span className={`status status-${item.status}`}>{STATUS_LABEL[item.status as StatusCode]}</span>
              </span>
            </div>
            <p className="muted">{item.refCode} · {item.city ? CITY_LABEL[item.city as CityCode] : "No city"}{item.suburb ? ` · ${item.suburb}` : ""}</p>
            <p className="tiny">{new Date(item.createdAt).toLocaleString("en-ZA")}</p>
            <LinkPending overlay label="Opening" />
          </Link>
        ))}
        {queue.results.length === 0 ? <p className="empty">No applications match this filter.</p> : null}
      </section>
      {session?.role === "SUPERADMIN" ? <StaffForm /> : null}
    </main>
  )
}
