import { Spinner } from "@/components/spinner"

export function LoadingScreen({ label }: { label: string }) {
  return (
    <main className="page" aria-live="polite" aria-busy="true">
      <p className="loading-label"><Spinner /> {label}</p>
      <div className="skel lg" />
      <div className="skel" />
      <div className="skel" />
    </main>
  )
}
