import { PublicHeader } from "@/components/public-header"
import { ServiceWorker } from "@/components/service-worker"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <ServiceWorker />
      <PublicHeader />
      {children}
      <footer className="footer">
        <span>Foundation 2000 · Johannesburg and Cape Town</span>
      </footer>
    </div>
  )
}
