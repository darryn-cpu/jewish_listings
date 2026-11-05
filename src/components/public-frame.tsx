"use client"

import { usePathname } from "next/navigation"
import { AppIntro } from "@/components/app-intro"
import { PublicHeader } from "@/components/public-header"
import { ServiceWorker } from "@/components/service-worker"

export function PublicFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === "/") {
    return (
      <div className="phone">
        <ServiceWorker />
        <AppIntro />
        {children}
      </div>
    )
  }

  return (
    <div className="shell site">
      <ServiceWorker />
      <PublicHeader />
      {children}
      <footer className="footer">
        <span>Foundation 2000 · Johannesburg and Cape Town</span>
      </footer>
    </div>
  )
}
