"use client"

import { useState, type FormEvent } from "react"
import { Spinner } from "@/components/spinner"

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setPending(true)
    setError(null)
    try {
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
      const next = nextPath.startsWith("/admin") && !nextPath.startsWith("//") ? nextPath : "/admin"
      window.location.assign(next)
    } catch {
      setPending(false)
      setError("Sign-in failed. Check the connection and try again.")
    }
  }

  return (
    <form className="panel" onSubmit={onSubmit} aria-busy={pending}>
      <label className="field"><span>Email</span><input name="email" type="email" autoComplete="username" required disabled={pending} /></label>
      <label className="field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required disabled={pending} /></label>
      {error ? <p className="alert" role="alert">{error}</p> : null}
      <button className={pending ? "btn-primary is-busy" : "btn-primary"} type="submit" disabled={pending}>
        {pending ? <><Spinner /> Signing in</> : "Sign in"}
      </button>
      {pending ? <p className="loading-label" role="status">Checking your account and opening the queue.</p> : null}
    </form>
  )
}
