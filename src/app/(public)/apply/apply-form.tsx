"use client"

import Script from "next/script"
import { useState } from "react"
import type { DirectoryMetadata } from "@/lib/directory"
import { CITY_LABEL, REGISTRATION_LABEL } from "@/lib/labels"

type RegistrationType = keyof typeof REGISTRATION_LABEL

type LocationDraft = {
  branchName: string
  addressLine1: string
  addressLine2: string
  suburb: string
  city: "JOHANNESBURG" | "CAPE_TOWN"
  postalCode: string
  isPrimary: boolean
}

const emptyLocation = (): LocationDraft => ({
  branchName: "",
  addressLine1: "",
  addressLine2: "",
  suburb: "",
  city: "JOHANNESBURG",
  postalCode: "",
  isPrimary: true,
})

const steps = ["Identity", "Operations", "Category", "Ownership", "Kosher", "Consent"]

const stepOfSection: Record<string, number> = {
  identity: 0,
  operations: 1,
  categorization: 2,
  ownership: 3,
  kosher: 4,
  legal: 5,
}

type FieldIssue = { path: Array<string | number>; message: string }

function readIssues(details: unknown): FieldIssue[] {
  const issues = (details as { issues?: unknown } | null)?.issues
  if (!Array.isArray(issues)) return []
  return issues.flatMap((issue) => {
    if (!issue || typeof issue !== "object") return []
    const message = "message" in issue && typeof issue.message === "string" ? issue.message : ""
    const path = "path" in issue && Array.isArray(issue.path) ? issue.path.filter((part) => typeof part === "string" || typeof part === "number") : []
    return message ? [{ path, message }] : []
  })
}

export function ApplyForm({ metadata }: { metadata: DirectoryMetadata }) {
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [issues, setIssues] = useState<FieldIssue[]>([])
  const [pending, setPending] = useState(false)
  const [receipt, setReceipt] = useState<{ refCode: string; statusToken: string } | null>(null)
  const [legalName, setLegalName] = useState("")
  const [tradingName, setTradingName] = useState("")
  const [registrationType, setRegistrationType] = useState<RegistrationType>("CIPC_REGISTERED_COMPANY")
  const [cipcNumber, setCipcNumber] = useState("")
  const [cipcUploadId, setCipcUploadId] = useState("")
  const [proofOfAddressUploadId, setProofOfAddressUploadId] = useState("")
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C" | "BOTH">("B2C")
  const [operationalFormat, setOperationalFormat] = useState<"PHYSICAL" | "ONLINE" | "HYBRID">("PHYSICAL")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [locations, setLocations] = useState<LocationDraft[]>([emptyLocation()])
  const [industryId, setIndustryId] = useState(metadata.industries[0]?.id ?? "")
  const [tagIds, setTagIds] = useState<string[]>([])
  const [customDescription, setCustomDescription] = useState("")
  const [ownership, setOwnership] = useState(100)
  const [synagogueChoice, setSynagogueChoice] = useState("")
  const [synagogueOtherName, setSynagogueOtherName] = useState("")
  const [rabbiContactName, setRabbiContactName] = useState("")
  const [rabbiContactPhone, setRabbiContactPhone] = useState("")
  const [jewishProofUploadId, setJewishProofUploadId] = useState("")
  const [offersKosher, setOffersKosher] = useState(false)
  const [brandName, setBrandName] = useState("")
  const [bethDinCertNumber, setBethDinCertNumber] = useState("")
  const [certUploadId, setCertUploadId] = useState("")
  const [allowsBulkOrdering, setAllowsBulkOrdering] = useState(false)
  const [meat, setMeat] = useState(false)
  const [dairy, setDairy] = useState(false)
  const [chalavYisrael, setChalavYisrael] = useState(false)
  const [parev, setParev] = useState(false)
  const [mehadrin, setMehadrin] = useState(false)
  const [offersDiscount, setOffersDiscount] = useState(false)
  const [discountDetails, setDiscountDetails] = useState("")
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [accuracyDeclared, setAccuracyDeclared] = useState(false)

  const industry = metadata.industries.find((item) => item.id === industryId) ?? metadata.industries[0]
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  function issueFor(path: string) {
    return issues.find((issue) => issue.path.map(String).join(".") === path)?.message
  }

  function updateLocation(index: number, patch: Partial<LocationDraft>) {
    setLocations((current) => current.map((location, locationIndex) => (locationIndex === index ? { ...location, ...patch } : location)))
  }

  function validateStep() {
    if (step === 0 && !legalName.trim()) return "Enter the legal name."
    if (step === 0 && registrationType === "CIPC_REGISTERED_COMPANY" && (!cipcNumber.trim() || !cipcUploadId)) return "Add the CIPC number and document."
    if (step === 0 && !proofOfAddressUploadId) return "Upload proof of address."
    if (step === 1 && (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim())) return "Enter the contact name, phone, and email."
    if (step === 1 && locations.some((location) => !location.suburb.trim())) return "Each branch needs a suburb."
    if (step === 1 && operationalFormat !== "ONLINE" && locations.some((location) => !location.addressLine1.trim())) return "Physical and hybrid branches need a street address."
    if (step === 2 && tagIds.length === 0) return "Choose at least one service tag."
    if (step === 2 && customDescription.length > 250) return "Keep the description to 250 characters."
    if (step === 3 && (!rabbiContactName.trim() || !rabbiContactPhone.trim() || !jewishProofUploadId)) return "Add the rabbi contact and the verification document."
    if (step === 3 && !synagogueChoice) return "Choose a synagogue or Other."
    if (step === 3 && synagogueChoice === "other" && !synagogueOtherName.trim()) return "Enter the synagogue name."
    if (step === 4 && offersKosher && (!brandName.trim() || !bethDinCertNumber.trim() || !certUploadId)) return "Complete the kosher certificate or skip this step."
    if (step === 5 && offersDiscount && !discountDetails.trim()) return "Describe the community discount."
    if (step === 5 && (!consentAccepted || !accuracyDeclared)) return "Both declarations are required."
    return null
  }

  async function submit() {
    const problem = validateStep()
    if (problem) {
      setIssues([])
      setError(problem)
      return
    }
    setPending(true)
    setError(null)
    setIssues([])
    const turnstileToken = (document.querySelector<HTMLTextAreaElement>("[name='cf-turnstile-response']")?.value) || undefined
    const response = await fetch("/api/v1/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turnstileToken,
        identity: {
          legalName,
          tradingName,
          registrationType,
          cipcNumber: registrationType === "CIPC_REGISTERED_COMPANY" ? cipcNumber : undefined,
          cipcUploadId: registrationType === "CIPC_REGISTERED_COMPANY" ? cipcUploadId : undefined,
          proofOfAddressUploadId,
        },
        operations: {
          businessModel,
          operationalFormat,
          websiteUrl,
          contactName,
          contactPhone,
          contactEmail,
          locations: locations.map((location) => ({
            ...location,
            branchName: location.branchName || undefined,
            addressLine2: location.addressLine2 || undefined,
            postalCode: location.postalCode || undefined,
          })),
        },
        categorization: { industryId, tagIds, customDescription },
        ownership: {
          jewishOwnershipPercentage: ownership,
          synagogueId: synagogueChoice !== "other" ? synagogueChoice : undefined,
          synagogueOtherName: synagogueChoice === "other" ? synagogueOtherName : undefined,
          rabbiContactName,
          rabbiContactPhone,
          jewishProofUploadId,
        },
        kosher: offersKosher
          ? { brandName, bethDinCertNumber, certUploadId, allowsBulkOrdering, meat, dairy, chalavYisrael, parev, mehadrin }
          : undefined,
        legal: { offersDiscount, discountDetails: offersDiscount ? discountDetails : undefined, consentAccepted, accuracyDeclared },
      }),
    })
    const body = await response.json()
    setPending(false)
    if (!response.ok) {
      const found = readIssues(body.error?.details)
      setIssues(found)
      const messages = [...new Set(found.map((issue) => issue.message))]
      setError(messages.join("\n") || body.error?.message || "The application could not be submitted.")
      const stepsHit = found.flatMap((issue) => {
        const index = stepOfSection[String(issue.path[0])]
        return index == null ? [] : [index]
      })
      if (stepsHit.length) setStep(Math.min(...stepsHit))
      return
    }
    setReceipt({ refCode: body.refCode, statusToken: body.statusToken })
  }

  if (receipt) {
    return (
      <section className="panel">
        <p className="kicker">Application received</p>
        <h1>{receipt.refCode}</h1>
        <p>Save this status token. It is shown once and is required to check the application later.</p>
        <p className="token">{receipt.statusToken}</p>
        <a className="btn-primary" href={`/apply?view=status&ref=${encodeURIComponent(receipt.refCode)}&token=${encodeURIComponent(receipt.statusToken)}`}>Check status</a>
      </section>
    )
  }

  return (
    <section className="panel" spellCheck={false}>
      <div className="steps" aria-hidden="true">{steps.map((label, index) => <i className={index <= step ? "on" : ""} key={label} />)}</div>
      <p className="kicker">Step {step + 1} of {steps.length}</p>
      <h1>{steps[step]}</h1>
      {step === 0 ? (
        <div className="stack">
          <Field path="identity.legalName" label="Legal name" issue={issueFor("identity.legalName")}><input value={legalName} onChange={(event) => setLegalName(event.target.value)} /></Field>
          <Field path="identity.tradingName" label="Trading name" issue={issueFor("identity.tradingName")}><input value={tradingName} onChange={(event) => setTradingName(event.target.value)} /></Field>
          <label className="field">
            <span>Legal entity</span>
            <select value={registrationType} onChange={(event) => setRegistrationType(event.target.value as RegistrationType)}>
              {Object.entries(REGISTRATION_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          {registrationType === "CIPC_REGISTERED_COMPANY" ? (
            <>
              <Field path="identity.cipcNumber" label="CIPC number" issue={issueFor("identity.cipcNumber")}><input value={cipcNumber} onChange={(event) => setCipcNumber(event.target.value)} placeholder="2020/123456/07" /></Field>
              <UploadField purpose="CIPC" label="CIPC document" issue={issueFor("identity.cipcUploadId")} onUploaded={setCipcUploadId} />
            </>
          ) : null}
          <UploadField purpose="ADDRESS" label="Proof of address" issue={issueFor("identity.proofOfAddressUploadId")} onUploaded={setProofOfAddressUploadId} />
        </div>
      ) : null}
      {step === 1 ? (
        <div className="stack">
          <div className="form-grid two">
            <label className="field">
              <span>Customers</span>
              <select value={businessModel} onChange={(event) => setBusinessModel(event.target.value as typeof businessModel)}>
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
                <option value="BOTH">Both</option>
              </select>
            </label>
            <label className="field">
              <span>How you operate</span>
              <select value={operationalFormat} onChange={(event) => setOperationalFormat(event.target.value as typeof operationalFormat)}>
                <option value="PHYSICAL">Physical</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </label>
          </div>
          <Field path="operations.websiteUrl" label="Website" issue={issueFor("operations.websiteUrl")}><input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://" /></Field>
          <Field path="operations.contactName" label="Contact name" issue={issueFor("operations.contactName")}><input value={contactName} onChange={(event) => setContactName(event.target.value)} /></Field>
          <Field path="operations.contactPhone" label="Phone" issue={issueFor("operations.contactPhone")}><input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} inputMode="tel" /></Field>
          <Field path="operations.contactEmail" label="Email" issue={issueFor("operations.contactEmail")}><input value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} inputMode="email" /></Field>
          <div className="locations">
            {locations.map((location, index) => (
              <div className="location" key={index}>
                <Field path={`operations.locations.${index}.branchName`} label="Branch name" issue={issueFor(`operations.locations.${index}.branchName`)}><input value={location.branchName} onChange={(event) => updateLocation(index, { branchName: event.target.value })} /></Field>
                <Field path={`operations.locations.${index}.addressLine1`} label="Street address" issue={issueFor(`operations.locations.${index}.addressLine1`)}><input value={location.addressLine1} onChange={(event) => updateLocation(index, { addressLine1: event.target.value })} /></Field>
                <Field path={`operations.locations.${index}.addressLine2`} label="Address line 2" issue={issueFor(`operations.locations.${index}.addressLine2`)}><input value={location.addressLine2} onChange={(event) => updateLocation(index, { addressLine2: event.target.value })} /></Field>
                <Field path={`operations.locations.${index}.suburb`} label="Suburb" issue={issueFor(`operations.locations.${index}.suburb`)}><input value={location.suburb} onChange={(event) => updateLocation(index, { suburb: event.target.value })} /></Field>
                <label className="field">
                  <span>City</span>
                  <select value={location.city} onChange={(event) => updateLocation(index, { city: event.target.value as LocationDraft["city"] })}>
                    {Object.entries(CITY_LABEL).filter(([value]) => value !== "OTHER").map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <Field path={`operations.locations.${index}.postalCode`} label="Postal code" issue={issueFor(`operations.locations.${index}.postalCode`)}><input value={location.postalCode} onChange={(event) => updateLocation(index, { postalCode: event.target.value })} inputMode="numeric" /></Field>
                <label className="check">
                  <input
                    type="radio"
                    name="primary"
                    checked={location.isPrimary}
                    onChange={() => setLocations((current) => current.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index })))}
                  />
                  Primary branch
                </label>
              </div>
            ))}
          </div>
          <button className="btn" type="button" onClick={() => setLocations((current) => [...current, { ...emptyLocation(), isPrimary: false }])}>Add a branch</button>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="stack">
          <label className="field">
            <span>Industry</span>
            <select value={industryId} onChange={(event) => { setIndustryId(event.target.value); setTagIds([]) }}>
              {metadata.industries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <div className="stack">
            {industry?.tags.map((tag) => (
              <label className="check" key={tag.id}>
                <input
                  type="checkbox"
                  checked={tagIds.includes(tag.id)}
                  onChange={(event) => setTagIds((current) => event.target.checked ? [...current, tag.id] : current.filter((id) => id !== tag.id))}
                />
                {tag.name}
              </label>
            ))}
          </div>
          {issueFor("categorization.tagIds") ? <p className="ferr">{issueFor("categorization.tagIds")}</p> : null}
          <Field path="categorization.customDescription" label={`Short description (${customDescription.length}/250)`} issue={issueFor("categorization.customDescription")}>
            <textarea maxLength={250} value={customDescription} onChange={(event) => setCustomDescription(event.target.value)} />
          </Field>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="stack">
          <label className="field">
            <span>Jewish ownership ({ownership}%)</span>
            <input type="range" min={1} max={100} value={ownership} onChange={(event) => setOwnership(Number(event.target.value))} />
          </label>
          <Field path="ownership.synagogueId" label="Synagogue" issue={issueFor("ownership.synagogueId")}>
            <select value={synagogueChoice} onChange={(event) => setSynagogueChoice(event.target.value)}>
              <option value="">Choose</option>
              {metadata.synagogues.map((synagogue) => <option key={synagogue.id} value={synagogue.id}>{synagogue.name} · {CITY_LABEL[synagogue.city]}</option>)}
              <option value="other">Other</option>
            </select>
          </Field>
          {synagogueChoice === "other" ? (
            <Field path="ownership.synagogueOtherName" label="Synagogue name" issue={issueFor("ownership.synagogueOtherName")}><input value={synagogueOtherName} onChange={(event) => setSynagogueOtherName(event.target.value)} /></Field>
          ) : null}
          <Field path="ownership.rabbiContactName" label="Rabbi name" issue={issueFor("ownership.rabbiContactName")}><input value={rabbiContactName} onChange={(event) => setRabbiContactName(event.target.value)} /></Field>
          <Field path="ownership.rabbiContactPhone" label="Rabbi phone" issue={issueFor("ownership.rabbiContactPhone")}><input value={rabbiContactPhone} onChange={(event) => setRabbiContactPhone(event.target.value)} inputMode="tel" /></Field>
          <UploadField purpose="JEWISH_PROOF" label="Rabbinical letter or ketubah" issue={issueFor("ownership.jewishProofUploadId")} onUploaded={setJewishProofUploadId} />
        </div>
      ) : null}
      {step === 4 ? (
        <div className="stack">
          <label className="check"><input type="checkbox" checked={offersKosher} onChange={(event) => setOffersKosher(event.target.checked)} /> This business has a kosher brand</label>
          {offersKosher ? (
            <>
              <Field path="kosher.brandName" label="Brand" issue={issueFor("kosher.brandName")}><input value={brandName} onChange={(event) => setBrandName(event.target.value)} /></Field>
              <Field path="kosher.bethDinCertNumber" label="Beth Din certificate number" issue={issueFor("kosher.bethDinCertNumber")}><input value={bethDinCertNumber} onChange={(event) => setBethDinCertNumber(event.target.value)} /></Field>
              <UploadField purpose="BETH_DIN" label="Kashrut certificate" issue={issueFor("kosher.certUploadId")} onUploaded={setCertUploadId} />
              <label className="check"><input type="checkbox" checked={allowsBulkOrdering} onChange={(event) => setAllowsBulkOrdering(event.target.checked)} /> Wholesale or bulk purchasing</label>
              <label className="check"><input type="checkbox" checked={meat} onChange={(event) => setMeat(event.target.checked)} /> Meat</label>
              <label className="check"><input type="checkbox" checked={dairy} onChange={(event) => setDairy(event.target.checked)} /> Dairy</label>
              <label className="check"><input type="checkbox" checked={chalavYisrael} onChange={(event) => setChalavYisrael(event.target.checked)} /> Chalav Yisrael</label>
              <label className="check"><input type="checkbox" checked={parev} onChange={(event) => setParev(event.target.checked)} /> Parev</label>
              <label className="check"><input type="checkbox" checked={mehadrin} onChange={(event) => setMehadrin(event.target.checked)} /> Mehadrin</label>
            </>
          ) : <p className="muted">Leave this off if the business is not a kosher food brand.</p>}
        </div>
      ) : null}
      {step === 5 ? (
        <div className="stack">
          <label className="check"><input type="checkbox" checked={offersDiscount} onChange={(event) => setOffersDiscount(event.target.checked)} /> Offer a community discount</label>
          {offersDiscount ? (
            <Field path="legal.discountDetails" label="Discount terms" issue={issueFor("legal.discountDetails")}>
              <textarea value={discountDetails} onChange={(event) => setDiscountDetails(event.target.value)} />
            </Field>
          ) : null}
          <label className={issueFor("legal.consentAccepted") ? "check bad" : "check"}><input type="checkbox" checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} /> I consent to publishing the approved listing in the directory.</label>
          <label className={issueFor("legal.accuracyDeclared") ? "check bad" : "check"}><input type="checkbox" checked={accuracyDeclared} onChange={(event) => setAccuracyDeclared(event.target.checked)} /> I declare that the information and documents are accurate.</label>
          {siteKey ? <Turnstile siteKey={siteKey} /> : <p className="tiny">Bot check is off in this environment.</p>}
        </div>
      ) : null}
      {error ? (
        <div className="alert" role="alert">
          {error.split("\n").map((line) => <p key={line}>{line}</p>)}
        </div>
      ) : null}
      <div className="row">
        {step > 0 ? <button className="btn" type="button" onClick={() => { setError(null); setIssues([]); setStep((current) => current - 1) }}>Back</button> : null}
        {step < steps.length - 1 ? (
          <button className="btn-primary" type="button" onClick={() => { const problem = validateStep(); setIssues([]); setError(problem); if (!problem) setStep((current) => current + 1) }}>Continue</button>
        ) : (
          <button className="btn-primary" type="button" disabled={pending} onClick={submit}>{pending ? "Submitting" : "Submit application"}</button>
        )}
      </div>
    </section>
  )
}

function Field({ label, issue, children }: { path: string; label: string; issue?: string; children: React.ReactNode }) {
  return (
    <label className={issue ? "field bad" : "field"}>
      <span>{label}</span>
      {children}
      {issue ? <span className="ferr">{issue}</span> : null}
    </label>
  )
}

function UploadField({ purpose, label, issue, onUploaded }: { purpose: string; label: string; issue?: string; onUploaded: (id: string) => void }) {
  const [name, setName] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setMessage(null)
    try {
      const presign = await fetch("/api/v1/uploads/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose, mimeType: file.type, sizeBytes: file.size }),
      })
      const body = await presign.json()
      if (!presign.ok) throw new Error(body.error?.message ?? "The upload could not start.")
      const payload = new FormData()
      payload.append("cacheControl", "3600")
      payload.append("", file)
      const put = await fetch(body.signedUrl, {
        method: "PUT",
        headers: { "x-upsert": "false" },
        body: payload,
      })
      if (!put.ok) throw new Error("The file did not upload.")
      onUploaded(body.uploadId)
      setName(file.name)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <label className={issue ? "field bad" : "field"}>
      <span>{label}</span>
      <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => onFile(event.target.files?.[0])} />
      {name ? <span className="tiny">{busy ? "Uploading" : `Uploaded ${name}`}</span> : null}
      {issue ? <span className="ferr">{issue}</span> : null}
      {message ? <span className="alert">{message}</span> : null}
    </label>
  )
}

function Turnstile({ siteKey }: { siteKey: string }) {
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div className="cf-turnstile" data-sitekey={siteKey} />
    </>
  )
}
