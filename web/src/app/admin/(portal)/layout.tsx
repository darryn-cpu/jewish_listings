import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/sign-out-button"
import { getSession } from "@/server/session"

export const dynamic = "force-dynamic"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/admin/login")
  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="brand">Vetting desk</p>
          <p className="tiny">{session.email}</p>
        </div>
        <SignOutButton />
      </header>
      {children}
    </div>
  )
}
