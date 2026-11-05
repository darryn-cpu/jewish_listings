"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/spinner"

type Pending = "disable" | "enable" | "remove"

export function ListingActions({ id, disabled }: { id: string; disabled: boolean }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)
  const [refreshing, startTransition] = useTransition()
  const busy = pending !== null || refreshing

  async function setDisabled(next: boolean) {
    setPending(next ? "disable" : "enable")
    setError(null)
    try {
      const response = await fetch(`/api/v1/admin/applications/${id}/listing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: next }),
      })
      const body = await response.json()
      if (!response.ok) {
        setPending(null)
        setError(body.error?.message ?? "The listing could not be updated.")
        return
      }
      setPending(null)
      startTransition(() => router.refresh())
    } catch {
      setPending(null)
      setError("The listing could not be updated. Check the connection and try again.")
    }
  }

  async function remove() {
    setPending("remove")
    setError(null)
    try {
      const response = await fetch(`/api/v1/admin/applications/${id}`, { method: "DELETE" })
      const body = await response.json()
      if (!response.ok) {
        setPending(null)
        setError(body.error?.message ?? "The listing could not be removed.")
        return
      }
      startTransition(() => router.push("/admin"))
    } catch {
      setPending(null)
      setError("The listing could not be removed. Check the connection and try again.")
    }
  }

  return (
    <section className="panel" aria-busy={busy}>
      <h2>Public listing</h2>
      <p>{disabled ? "This listing is hidden from the directory. The approval is unchanged." : "This listing is on the public directory."}</p>
      {error ? <p className="alert" role="alert">{error}</p> : null}
      {busy ? <p className="loading-label" role="status">{pending === "remove" ? "Removing the listing" : refreshing ? "Updating the listing" : disabled ? "Enabling the listing" : "Disabling the listing"}</p> : null}
      {confirming ? (
        <>
          <p className="alert" role="alert">Remove this listing from the directory and the review queue? This cannot be undone.</p>
          <div className="form-actions">
            <button className="btn" type="button" disabled={busy} onClick={() => setConfirming(false)}>Keep listing</button>
            <button className={pending === "remove" ? "btn-danger is-busy" : "btn-danger"} type="button" disabled={busy} onClick={() => void remove()}>
              {pending === "remove" ? <><Spinner /> Removing</> : "Remove listing"}
            </button>
          </div>
        </>
      ) : (
        <div className="form-actions">
          {disabled ? (
            <button className={pending === "enable" ? "btn-primary is-busy" : "btn-primary"} type="button" disabled={busy} onClick={() => void setDisabled(false)}>
              {pending === "enable" ? <><Spinner /> Enabling</> : "Enable listing"}
            </button>
          ) : (
            <button className={pending === "disable" ? "btn is-busy" : "btn"} type="button" disabled={busy} onClick={() => void setDisabled(true)}>
              {pending === "disable" ? <><Spinner /> Disabling</> : "Disable listing"}
            </button>
          )}
          <button className="btn-danger" type="button" disabled={busy} onClick={() => setConfirming(true)}>Remove</button>
        </div>
      )}
    </section>
  )
}
