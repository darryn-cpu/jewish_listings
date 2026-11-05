"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/spinner"
import { REASON_LABEL } from "@/lib/labels"

type Decision = "APPROVED" | "REQUIRES_INFO" | "REJECTED"

export function ReviewActions({ id }: { id: string }) {
  const router = useRouter()
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")
  const [reason, setReason] = useState<keyof typeof REASON_LABEL>("INCOMPLETE_DOCUMENTS")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Decision | null>(null)
  const [refreshing, startTransition] = useTransition()
  const busy = pending !== null || refreshing

  async function send(status: Decision) {
    if (status === "REQUIRES_INFO" && !message.trim()) {
      setError("Write the message the applicant will receive.")
      return
    }
    setPending(status)
    setError(null)
    try {
      const response = await fetch(`/api/v1/admin/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewerNotes: notes.trim() || undefined,
          applicantMessage: status === "REQUIRES_INFO" ? message.trim() : undefined,
          reasonCode: status === "REJECTED" ? reason : undefined,
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        setPending(null)
        setError(body.error?.message ?? "The status could not be changed.")
        return
      }
      setMessage("")
      setPending(null)
      startTransition(() => router.refresh())
    } catch {
      setPending(null)
      setError("The status could not be changed. Check the connection and try again.")
    }
  }

  return (
    <section className="panel" aria-busy={busy}>
      <h2>Decision</h2>
      <label className="field">
        <span>Internal note</span>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Visible to staff only" disabled={busy} />
      </label>
      <label className="field">
        <span>Message to the applicant</span>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Required when asking for more information" disabled={busy} />
      </label>
      <label className="field">
        <span>Rejection reason</span>
        <select value={reason} onChange={(event) => setReason(event.target.value as keyof typeof REASON_LABEL)} disabled={busy}>
          {Object.entries(REASON_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {error ? <p className="alert" role="alert">{error}</p> : null}
      {busy ? <p className="loading-label" role="status">{refreshing && !pending ? "Updating the application" : "Saving this decision"}</p> : null}
      <div className="form-actions">
        <button className={pending === "APPROVED" ? "btn-primary is-busy" : "btn-primary"} type="button" disabled={busy} onClick={() => send("APPROVED")}>
          {pending === "APPROVED" ? <><Spinner /> Approving</> : "Approve"}
        </button>
        <button className={pending === "REQUIRES_INFO" ? "btn is-busy" : "btn"} type="button" disabled={busy} onClick={() => send("REQUIRES_INFO")}>
          {pending === "REQUIRES_INFO" ? <><Spinner /> Sending</> : "Request info"}
        </button>
        <button className={pending === "REJECTED" ? "btn-danger is-busy" : "btn-danger"} type="button" disabled={busy} onClick={() => send("REJECTED")}>
          {pending === "REJECTED" ? <><Spinner /> Rejecting</> : "Reject"}
        </button>
      </div>
    </section>
  )
}
