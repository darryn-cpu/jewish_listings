"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/spinner"

export function StaffForm() {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [refreshing, startTransition] = useTransition()
  const busy = pending || refreshing

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setError(null)
    setMessage(null)
    setPending(true)
    try {
      const response = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          role: formData.get("role"),
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        setPending(false)
        setError(body.error?.message ?? "The account could not be created.")
        return
      }
      setMessage(`Created ${body.email}.`)
      form.reset()
      setPending(false)
      startTransition(() => router.refresh())
    } catch {
      setPending(false)
      setError("The account could not be created. Check the connection and try again.")
    }
  }

  return (
    <form className="panel" onSubmit={onSubmit} aria-busy={busy}>
      <h2>Add a staff account</h2>
      <label className="field"><span>Email</span><input name="email" type="email" required disabled={busy} /></label>
      <label className="field"><span>Password</span><input name="password" type="password" minLength={10} required autoComplete="new-password" disabled={busy} /></label>
      <label className="field">
        <span>Role</span>
        <select name="role" defaultValue="REVIEWER" disabled={busy}>
          <option value="REVIEWER">Reviewer</option>
          <option value="SUPERADMIN">Super admin</option>
        </select>
      </label>
      {error ? <p className="alert">{error}</p> : null}
      {message ? <p className="ok-note">{message}</p> : null}
      <button className={busy ? "btn-primary is-busy" : "btn-primary"} type="submit" disabled={busy}>
        {busy ? <><Spinner /> Creating account</> : "Create account"}
      </button>
    </form>
  )
}
