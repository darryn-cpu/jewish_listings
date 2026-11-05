"use client"

import { useState } from "react"

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const response = await fetch("/api/v1/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }),
    })
    const body = await response.json()
    if (!response.ok) {
      setPending(false)
      setError(body.error?.message ?? "Sign-in failed.")
      return
    }
    window.location.href = nextPath.startsWith("/admin") && !nextPath.startsWith("//") ? nextPath : "/admin"
  }

  return (
    <form className="panel" action={onSubmit}>
      <label className="field"><span>Email</span><input name="email" type="email" autoComplete="username" required /></label>
      <label className="field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
      {error ? <p className="alert" role="alert">{error}</p> : null}
      <button className="btn-primary" type="submit" disabled={pending}>{pending ? "Signing in" : "Sign in"}</button>
    </form>
  )
}
