"use client"

import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Spinner } from "@/components/spinner"

const NavPending = createContext(false)

function canonical(search: string) {
  return [...new URLSearchParams(search).entries()]
    .filter(([, value]) => value.trim())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value.trim()}`)
    .join("&")
}

export function NavForm({
  action,
  current,
  className,
  children,
}: {
  action: string
  current: string
  className?: string
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setPending(false)
  }, [current, pathname])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    for (const [key, value] of new FormData(event.currentTarget).entries()) {
      if (typeof value === "string" && value.trim()) params.set(key, value.trim())
    }
    const next = params.toString()
    if (pathname === action && canonical(next) === canonical(current)) return
    setPending(true)
    router.push(next ? `${action}?${next}` : action)
  }

  return (
    <form className={className} action={action} method="get" onSubmit={onSubmit} aria-busy={pending}>
      <NavPending.Provider value={pending}>{children}</NavPending.Provider>
    </form>
  )
}

export function NavSubmit({ idle, busy }: { idle: string; busy: string }) {
  const pending = useContext(NavPending)
  return (
    <button className={pending ? "btn-primary is-busy" : "btn-primary"} type="submit" disabled={pending}>
      {pending ? <><Spinner /> {busy}</> : idle}
    </button>
  )
}
