import { TransitionError } from "@/server/errors"

export { TransitionError }

export const APPLICATION_STATUSES = ["PENDING_REVIEW", "REQUIRES_INFO", "APPROVED", "REJECTED"] as const
export type ApplicationStatusName = (typeof APPLICATION_STATUSES)[number]

export const REJECTION_REASONS = [
  "INCOMPLETE_DOCUMENTS",
  "OWNERSHIP_UNVERIFIED",
  "OUTSIDE_SERVICE_AREA",
  "DUPLICATE",
  "FAILED_REFERENCE",
  "OTHER",
] as const
export type RejectionReasonName = (typeof REJECTION_REASONS)[number]

const allowed: Record<ApplicationStatusName, ApplicationStatusName[]> = {
  PENDING_REVIEW: ["REQUIRES_INFO", "APPROVED", "REJECTED"],
  REQUIRES_INFO: ["PENDING_REVIEW", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
}

export function canTransition(from: ApplicationStatusName, to: ApplicationStatusName) {
  return allowed[from].includes(to)
}

export function assertTransition(from: ApplicationStatusName, to: ApplicationStatusName) {
  if (!canTransition(from, to)) {
    throw new TransitionError(`A ${from.replaceAll("_", " ").toLowerCase()} application cannot move to ${to.replaceAll("_", " ").toLowerCase()}.`)
  }
}

export function assertTransitionInput(
  to: ApplicationStatusName,
  input: { applicantMessage?: string; reasonCode?: RejectionReasonName },
) {
  if (to === "REQUIRES_INFO" && !input.applicantMessage?.trim()) {
    throw new TransitionError("Tell the applicant what information is still needed.")
  }
  if (to === "REJECTED" && !input.reasonCode) {
    throw new TransitionError("Choose a rejection reason.")
  }
}
