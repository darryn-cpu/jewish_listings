"use client"

import { useState } from "react"
import { Spinner } from "@/components/spinner"

export function SignOutButton() {
  const [pending, setPending] = useState(false)

  return (
    <button
      className={pending ? "btn small is-busy" : "btn small"}
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        try {
          await fetch("/api/v1/admin/auth/logout", { method: "POST" })
          window.location.href = "/admin/login"
        } catch {
          setPending(false)
        }
      }}
    >
      {pending ? <><Spinner /> Signing out</> : "Sign out"}
    </button>
  )
}
