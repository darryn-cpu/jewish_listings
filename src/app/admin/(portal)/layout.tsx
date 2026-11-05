import { redirect } from "next/navigation"
import { BrandLink } from "@/components/brand"
import { SignOutButton } from "@/components/sign-out-button"
import { getSession } from "@/server/session"

export const dynamic = "force-dynamic"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/admin/login")
  return (
    <div className="shell site wide">
      <header className="topbar">
        <BrandLink href="/admin" subline="Vetting desk" />
        <div className="topbar-end">
          <span className="tiny">{session.email}</span>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  )
}
