"use client"

export function SignOutButton() {
  return (
    <button
      className="btn small"
      type="button"
      onClick={async () => {
        await fetch("/api/v1/admin/auth/logout", { method: "POST" })
        window.location.href = "/admin/login"
      }}
    >
      Sign out
    </button>
  )
}
