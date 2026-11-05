import { LoginForm } from "./login-form"
import { one } from "@/lib/directory"

export const metadata = { title: "Staff sign in" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const nextPath = one((await searchParams).next) ?? "/admin"
  return (
    <main className="shell page" style={{ paddingTop: 48 }}>
      <p className="kicker">Foundation 2000</p>
      <h1>Vetting desk</h1>
      <LoginForm nextPath={nextPath} />
    </main>
  )
}
