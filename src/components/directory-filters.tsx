"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import type { DirectoryMetadata } from "@/lib/directory"

type Initial = {
  search: string
  city: string
  category: string
  b2b: boolean
  b2c: boolean
  kosherOnly: boolean
  lat: string
  lng: string
  radiusKm: string
}

export function DirectoryFilters({ metadata, initial }: { metadata: DirectoryMetadata; initial: Initial }) {
  const router = useRouter()
  const [geo, setGeo] = useState({ lat: initial.lat, lng: initial.lng, radiusKm: initial.radiusKm || "25" })
  const [message, setMessage] = useState<string | null>(null)

  function nearMe() {
    if (!navigator.geolocation) {
      setMessage("This browser cannot share a location.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams(window.location.search)
        params.set("lat", String(position.coords.latitude))
        params.set("lng", String(position.coords.longitude))
        params.set("radiusKm", geo.radiusKm || "25")
        params.set("page", "1")
        setGeo({
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
          radiusKm: geo.radiusKm || "25",
        })
        router.push(`/?${params.toString()}`)
      },
      () => setMessage("Location permission was denied."),
    )
  }

  return (
    <form className="panel" action="/" method="get">
      <div className="filters">
        <label className="field">
          <span>Search</span>
          <input name="search" defaultValue={initial.search} placeholder="Name, suburb, or service" />
        </label>
        <label className="field">
          <span>City</span>
          <select name="city" defaultValue={initial.city}>
            <option value="">All places</option>
            {metadata.cities.map((city) => (
              <option key={city.id} value={city.id}>{city.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Category</span>
          <select name="category" defaultValue={initial.category}>
            <option value="">All categories</option>
            {metadata.industries.map((industry) => (
              <optgroup key={industry.id} label={industry.name}>
                <option value={industry.slug}>{industry.name}</option>
                {industry.tags.map((tag) => (
                  <option key={tag.id} value={tag.slug}>{tag.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>
      <div className="row">
        <label className="check"><input type="checkbox" name="b2b" value="true" defaultChecked={initial.b2b} /> B2B</label>
        <label className="check"><input type="checkbox" name="b2c" value="true" defaultChecked={initial.b2c} /> B2C</label>
        <label className="check"><input type="checkbox" name="kosherOnly" value="true" defaultChecked={initial.kosherOnly} /> Kosher certified</label>
      </div>
      <input type="hidden" name="lat" value={geo.lat} />
      <input type="hidden" name="lng" value={geo.lng} />
      <div className="row">
        <label className="field" style={{ width: 140 }}>
          <span>Radius km</span>
          <input name="radiusKm" value={geo.radiusKm} onChange={(event) => setGeo({ ...geo, radiusKm: event.target.value })} inputMode="decimal" />
        </label>
        <button className="btn" type="button" onClick={nearMe}>Near me</button>
        <button className="btn-primary" type="submit">Show businesses</button>
      </div>
      {message ? <p className="alert">{message}</p> : null}
    </form>
  )
}
