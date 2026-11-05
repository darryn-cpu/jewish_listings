import { LoginForm } from "./login-form"
import { BrandLink } from "@/components/brand"
import { one } from "@/lib/directory"

export const metadata = { title: "Staff sign in" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const nextPath = one((await searchParams).next) ?? "/admin"
  return (
    <div className="shell site narrow">
      <header className="topbar">
        <BrandLink href="/" subline="Vetting desk" />
      </header>
      <main className="page">
        <div>
          <p className="kicker">Foundation 2000</p>
          <h1>Staff sign in</h1>
          <p className="lede">Review applications and publish approved listings.</p>
        </div>
        <LoginForm nextPath={nextPath} />
      </main>
    </div>
  )
}
