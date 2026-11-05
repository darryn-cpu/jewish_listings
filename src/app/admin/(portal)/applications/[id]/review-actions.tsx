"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { REASON_LABEL } from "@/lib/labels"

export function ReviewActions({ id }: { id: string }) {
  const router = useRouter()
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")
  const [reason, setReason] = useState<keyof typeof REASON_LABEL>("INCOMPLETE_DOCUMENTS")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function send(status: "APPROVED" | "REQUIRES_INFO" | "REJECTED") {
    if (status === "REQUIRES_INFO" && !message.trim()) {
      setError("Write the message the applicant will receive.")
      return
    }
    setPending(true)
    setError(null)
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
    setPending(false)
    if (!response.ok) {
      setError(body.error?.message ?? "The status could not be changed.")
      return
    }
    setMessage("")
    router.refresh()
  }

  return (
    <section className="panel">
      <h2>Decision</h2>
      <label className="field">
        <span>Internal note</span>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Visible to staff only" />
      </label>
      <label className="field">
        <span>Message to the applicant</span>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Required when asking for more information" />
      </label>
      <label className="field">
        <span>Rejection reason</span>
        <select value={reason} onChange={(event) => setReason(event.target.value as keyof typeof REASON_LABEL)}>
          {Object.entries(REASON_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {error ? <p className="alert" role="alert">{error}</p> : null}
      <div className="form-actions">
        <button className="btn-primary" type="button" disabled={pending} onClick={() => send("APPROVED")}>Approve</button>
        <button className="btn" type="button" disabled={pending} onClick={() => send("REQUIRES_INFO")}>Request info</button>
        <button className="btn-danger" type="button" disabled={pending} onClick={() => send("REJECTED")}>Reject</button>
      </div>
    </section>
  )
}
