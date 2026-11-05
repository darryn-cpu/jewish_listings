"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function StaffForm() {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    setError(null)
    setMessage(null)
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
      setError(body.error?.message ?? "The account could not be created.")
      return
    }
    setMessage(`Created ${body.email}.`)
    router.refresh()
  }

  return (
    <form className="panel" action={onSubmit}>
      <h2>Add a staff account</h2>
      <label className="field"><span>Email</span><input name="email" type="email" required /></label>
      <label className="field"><span>Password</span><input name="password" type="password" minLength={10} required autoComplete="new-password" /></label>
      <label className="field">
        <span>Role</span>
        <select name="role" defaultValue="REVIEWER">
          <option value="REVIEWER">Reviewer</option>
          <option value="SUPERADMIN">Super admin</option>
        </select>
      </label>
      {error ? <p className="alert">{error}</p> : null}
      {message ? <p className="ok-note">{message}</p> : null}
      <button className="btn-primary" type="submit">Create account</button>
    </form>
  )
}
