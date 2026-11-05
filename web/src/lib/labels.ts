export const CITY_LABEL = {
  JOHANNESBURG: "Johannesburg",
  CAPE_TOWN: "Cape Town",
  OTHER: "Other",
} as const

export const STATUS_LABEL = {
  PENDING_REVIEW: "Pending review",
  REQUIRES_INFO: "Needs information",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const

export const REGISTRATION_LABEL = {
  CIPC_REGISTERED_COMPANY: "CIPC registered company",
  SOLE_PROPRIETOR: "Sole proprietor",
  PARTNERSHIP: "Partnership",
  TRUST: "Trust",
} as const

export const MODEL_LABEL = {
  B2B: "B2B",
  B2C: "B2C",
  BOTH: "B2B and B2C",
} as const

export const FORMAT_LABEL = {
  PHYSICAL: "Physical premises",
  ONLINE: "Online",
  HYBRID: "Hybrid",
} as const

export const REASON_LABEL = {
  INCOMPLETE_DOCUMENTS: "Incomplete documents",
  OWNERSHIP_UNVERIFIED: "Ownership not verified",
  OUTSIDE_SERVICE_AREA: "Outside Johannesburg and Cape Town",
  DUPLICATE: "Duplicate application",
  FAILED_REFERENCE: "Reference could not be confirmed",
  OTHER: "Other",
} as const

export type CityCode = keyof typeof CITY_LABEL
export type StatusCode = keyof typeof STATUS_LABEL
