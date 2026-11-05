import "server-only"
import bcrypt from "bcryptjs"
import { Prisma, type ApplicationStatus } from "@prisma/client"
import { isApplicantDocument } from "@/lib/foodType"
import { ApiError } from "@/server/errors"
import { invalidateDirectoryCache } from "@/server/cache"
import { requiresInfoEmail } from "@/server/mailTemplates"
import { sendMail } from "@/server/mailer"
import { prisma } from "@/server/prisma"
import { isRefCode } from "@/server/refCode"
import { assertTransition, assertTransitionInput, type ApplicationStatusName, type RejectionReasonName } from "@/server/stateMachine"
import { deleteStoredObjects, signedDownloadUrl } from "@/server/storage"
import { tokenMatches } from "@/server/token"

let dummyHash: string | null = null

async function dummyPasswordHash() {
  dummyHash ??= await bcrypt.hash("directory-dummy-password", 12)
  return dummyHash
}

export async function authenticateAdmin(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({ where: { email } })
  const matches = await bcrypt.compare(password, user?.passwordHash ?? (await dummyPasswordHash()))
  if (!user || !user.isActive || !matches) {
    throw new ApiError(401, "INVALID_LOGIN", "The email or password is incorrect.")
  }
  return user
}

export async function createStaffUser(input: { email: string; password: string; role: "SUPERADMIN" | "REVIEWER" }) {
  const passwordHash = await bcrypt.hash(input.password, 12)
  return prisma.adminUser.create({
    data: { email: input.email, passwordHash, role: input.role, isActive: true },
    select: { id: true, email: true, role: true, isActive: true },
  })
}

export function parseQueueQuery(params: URLSearchParams) {
  const statusValue = params.get("status")
  const statuses: ApplicationStatusName[] = ["PENDING_REVIEW", "REQUIRES_INFO", "APPROVED", "REJECTED"]
  const disabledOnly = statusValue === "DISABLED"
  if (statusValue && !disabledOnly && !statuses.includes(statusValue as ApplicationStatusName)) {
    throw new ApiError(400, "VALIDATION_ERROR", "That status filter is not recognised.")
  }
  const pageValue = Number(params.get("page") || "1")
  const limitValue = Number(params.get("limit") || "50")
  if (!Number.isInteger(pageValue) || pageValue < 1) {
    throw new ApiError(400, "VALIDATION_ERROR", "Page must be a positive whole number.")
  }
  if (!Number.isInteger(limitValue) || limitValue < 1) {
    throw new ApiError(400, "VALIDATION_ERROR", "Limit must be a positive whole number.")
  }
  const search = params.get("q")?.trim()
  return {
    status: (disabledOnly ? "APPROVED" : statusValue || undefined) as ApplicationStatus | undefined,
    disabledOnly,
    search: search ? search.slice(0, 80) : undefined,
    sort: params.get("sort") === "asc" ? "asc" as const : "desc" as const,
    page: pageValue,
    limit: Math.min(limitValue, 50),
  }
}

export async function listQueue(query: ReturnType<typeof parseQueueQuery>) {
  const where: Prisma.BusinessWhereInput = {
    status: query.status,
    ...(query.disabledOnly ? { disabledAt: { not: null } } : {}),
    ...(query.search
      ? {
          OR: [
            { legalName: { contains: query.search, mode: "insensitive" } },
            { tradingName: { contains: query.search, mode: "insensitive" } },
            { refCode: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  }
  const [total, results] = await Promise.all([
    prisma.business.count({ where }),
    prisma.business.findMany({
      where,
      orderBy: { createdAt: query.sort },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      select: {
        id: true,
        refCode: true,
        legalName: true,
        tradingName: true,
        status: true,
        disabledAt: true,
        createdAt: true,
        contactEmail: true,
        isTest: true,
        locations: { where: { isPrimary: true }, select: { city: true, suburb: true }, take: 1 },
      },
    }),
  ])
  return {
    page: query.page,
    limit: query.limit,
    total,
    results: results.map((row) => ({
      id: row.id,
      refCode: row.refCode,
      legalName: row.legalName,
      tradingName: row.tradingName,
      status: row.status,
      disabledAt: row.disabledAt?.toISOString() ?? null,
      isTest: row.isTest,
      createdAt: row.createdAt.toISOString(),
      contactEmail: row.contactEmail,
      city: row.locations[0]?.city ?? null,
      suburb: row.locations[0]?.suburb ?? null,
    })),
  }
}

export async function loadApplicationDocuments(slots: Array<{ purpose: string; label: string; objectKey: string | null }>) {
  const pending = slots.flatMap((slot) => {
    if (!isApplicantDocument(slot.objectKey)) return []
    return [{ purpose: slot.purpose, label: slot.label, objectKey: slot.objectKey }]
  })
  if (!pending.length) return []
  const uploads = await prisma.documentUpload.findMany({
    where: { objectKey: { in: pending.map((slot) => slot.objectKey) } },
    select: { objectKey: true, mimeType: true },
  })
  const mime = new Map(uploads.map((row) => [row.objectKey, row.mimeType]))
  const signed = await Promise.all(pending.map(async (slot) => {
    try {
      return [slot.objectKey, await signedDownloadUrl(slot.objectKey)] as const
    } catch (error) {
      console.error(error)
      return [slot.objectKey, null] as const
    }
  }))
  const urls = new Map(signed)
  return pending.map((slot) => ({
    purpose: slot.purpose,
    label: slot.label,
    mimeType: mime.get(slot.objectKey) ?? "application/octet-stream",
    url: urls.get(slot.objectKey) ?? null,
  }))
}

export async function getAdminApplication(id: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      industry: true,
      synagogue: true,
      locations: { orderBy: { isPrimary: "desc" } },
      tags: { include: { tag: true } },
      kosherCertification: true,
      auditLogs: { orderBy: { timestamp: "desc" }, include: { adminUser: { select: { email: true } } } },
    },
  })
  if (!business) return null
  const { statusTokenHash: _statusTokenHash, auditLogs, ...rest } = business
  void _statusTokenHash

  return {
    ...rest,
    createdAt: business.createdAt.toISOString(),
    updatedAt: business.updatedAt.toISOString(),
    approvedAt: business.approvedAt?.toISOString() ?? null,
    auditLogs: auditLogs.map((entry) => ({
      id: entry.id,
      previousStatus: entry.previousStatus,
      newStatus: entry.newStatus,
      comment: entry.comment,
      reasonCode: entry.reasonCode,
      timestamp: entry.timestamp.toISOString(),
      adminEmail: entry.adminUser.email,
    })),
  }
}

export async function changeApplicationStatus(
  id: string,
  adminUserId: string,
  input: {
    status: ApplicationStatusName
    applicantMessage?: string
    reviewerNotes?: string
    reasonCode?: RejectionReasonName
  },
) {
  assertTransitionInput(input.status, input)
  const current = await prisma.business.findUnique({ where: { id } })
  if (!current) throw new ApiError(404, "NOT_FOUND", "That application does not exist.")
  assertTransition(current.status, input.status)

  const updated = await prisma.$transaction(async (tx) => {
    const business = await tx.business.update({
      where: { id },
      data: {
        status: input.status,
        reviewerId: adminUserId,
        reviewerNotes: input.reviewerNotes?.trim() || current.reviewerNotes,
        approvedAt: input.status === "APPROVED" ? new Date() : current.approvedAt,
        rejectionReason: input.status === "REJECTED" ? input.reasonCode : null,
      },
    })
    await tx.auditLog.create({
      data: {
        businessId: id,
        adminUserId,
        previousStatus: current.status,
        newStatus: input.status,
        comment: input.applicantMessage?.trim() || input.reviewerNotes?.trim() || null,
        reasonCode: input.reasonCode,
      },
    })
    return business
  })

  if (current.status === "APPROVED" || updated.status === "APPROVED") {
    invalidateDirectoryCache()
  }

  let emailSent = false
  if (input.status === "REQUIRES_INFO" && input.applicantMessage) {
    const statusUrl = `${process.env.APP_URL || "http://localhost:3000"}/apply?view=status`
    const message = requiresInfoEmail({
      refCode: updated.refCode,
      message: input.applicantMessage,
      statusUrl,
    })
    const email = await sendMail({ to: updated.contactEmail, ...message }).catch(() => ({ sent: false as const }))
    emailSent = email.sent
  }

  return { id: updated.id, refCode: updated.refCode, status: updated.status, emailSent }
}

function assertApprovedListing(status: ApplicationStatus) {
  if (status !== "APPROVED") {
    throw new ApiError(409, "NOT_A_LISTING", "Only an approved listing can be disabled or removed.")
  }
}

export async function setListingDisabled(id: string, adminUserId: string, disabled: boolean) {
  const current = await prisma.business.findUnique({ where: { id }, select: { id: true, status: true, disabledAt: true } })
  if (!current) throw new ApiError(404, "NOT_FOUND", "That application does not exist.")
  assertApprovedListing(current.status)
  const already = current.disabledAt != null
  if (already === disabled) return { id: current.id, disabled }

  await prisma.$transaction(async (tx) => {
    await tx.business.update({
      where: { id },
      data: { disabledAt: disabled ? new Date() : null },
    })
    await tx.auditLog.create({
      data: {
        businessId: id,
        adminUserId,
        previousStatus: current.status,
        newStatus: current.status,
        comment: disabled ? "Listing disabled" : "Listing enabled",
      },
    })
  })
  invalidateDirectoryCache()
  return { id, disabled }
}

export async function removeListing(id: string, adminUserId: string) {
  const current = await prisma.business.findUnique({
    where: { id },
    select: {
      id: true,
      refCode: true,
      status: true,
      cipcDocKey: true,
      proofOfAddressKey: true,
      jewishProofDocKey: true,
      kosherCertification: { select: { certDocKey: true } },
    },
  })
  if (!current) throw new ApiError(404, "NOT_FOUND", "That application does not exist.")
  assertApprovedListing(current.status)
  const objectKeys = [current.cipcDocKey, current.proofOfAddressKey, current.jewishProofDocKey, current.kosherCertification?.certDocKey]
    .filter((key): key is string => Boolean(key))

  await prisma.$transaction(async (tx) => {
    if (objectKeys.length) {
      await tx.documentUpload.deleteMany({ where: { objectKey: { in: objectKeys } } })
    }
    await tx.business.delete({ where: { id } })
  })
  await deleteStoredObjects(objectKeys)
  invalidateDirectoryCache()
  console.info(JSON.stringify({ event: "listing_removed", businessId: id, refCode: current.refCode, adminUserId }))
  return { id, refCode: current.refCode, removed: true as const }
}

export async function getStats() {
  const rows = await prisma.$queryRaw<Array<{
    total: number
    pending: number
    approved: number
    disabled: number
    requiresInfo: number
    rejected: number
    johannesburg: number
    capeTown: number
    kosher: number
  }>>`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'PENDING_REVIEW'::"ApplicationStatus")::int AS pending,
      COUNT(*) FILTER (WHERE status = 'APPROVED'::"ApplicationStatus")::int AS approved,
      COUNT(*) FILTER (WHERE status = 'APPROVED'::"ApplicationStatus" AND "disabledAt" IS NOT NULL)::int AS disabled,
      COUNT(*) FILTER (WHERE status = 'REQUIRES_INFO'::"ApplicationStatus")::int AS "requiresInfo",
      COUNT(*) FILTER (WHERE status = 'REJECTED'::"ApplicationStatus")::int AS rejected,
      COUNT(*) FILTER (
        WHERE status = 'APPROVED'::"ApplicationStatus" AND "disabledAt" IS NULL AND EXISTS (
          SELECT 1 FROM "BusinessLocation" loc
          WHERE loc."businessId" = "Business".id AND loc.city = 'JOHANNESBURG'::"City"
        )
      )::int AS johannesburg,
      COUNT(*) FILTER (
        WHERE status = 'APPROVED'::"ApplicationStatus" AND "disabledAt" IS NULL AND EXISTS (
          SELECT 1 FROM "BusinessLocation" loc
          WHERE loc."businessId" = "Business".id AND loc.city = 'CAPE_TOWN'::"City"
        )
      )::int AS "capeTown",
      COUNT(*) FILTER (
        WHERE status = 'APPROVED'::"ApplicationStatus" AND "disabledAt" IS NULL AND EXISTS (
          SELECT 1 FROM "KosherCertification" cert
          WHERE cert."businessId" = "Business".id
        )
      )::int AS kosher
    FROM "Business"
  `
  const row = rows[0]
  return {
    total: Number(row?.total ?? 0),
    pending: Number(row?.pending ?? 0),
    approved: Number(row?.approved ?? 0),
    disabled: Number(row?.disabled ?? 0),
    requiresInfo: Number(row?.requiresInfo ?? 0),
    rejected: Number(row?.rejected ?? 0),
    johannesburg: Number(row?.johannesburg ?? 0),
    capeTown: Number(row?.capeTown ?? 0),
    kosher: Number(row?.kosher ?? 0),
  }
}

export async function lookupApplicationStatus(refCode: string, token: string) {
  if (!isRefCode(refCode) || token.length < 20) return null
  const business = await prisma.business.findUnique({
    where: { refCode },
    select: { refCode: true, status: true, updatedAt: true, statusTokenHash: true },
  })
  if (!business || !tokenMatches(token, business.statusTokenHash)) return null
  return {
    refCode: business.refCode,
    status: business.status,
    updatedAt: business.updatedAt.toISOString(),
  }
}
