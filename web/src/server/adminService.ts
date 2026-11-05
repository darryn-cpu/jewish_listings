import "server-only"
import bcrypt from "bcryptjs"
import { Prisma, type ApplicationStatus } from "@prisma/client"
import { ApiError } from "@/server/errors"
import { invalidateDirectoryCache } from "@/server/cache"
import { requiresInfoEmail } from "@/server/mailTemplates"
import { sendMail } from "@/server/mailer"
import { prisma } from "@/server/prisma"
import { isRefCode } from "@/server/refCode"
import { assertTransition, assertTransitionInput, type ApplicationStatusName, type RejectionReasonName } from "@/server/stateMachine"
import { signedDownloadUrl } from "@/server/storage"
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
  if (statusValue && !statuses.includes(statusValue as ApplicationStatusName)) {
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
    status: (statusValue || undefined) as ApplicationStatus | undefined,
    search: search ? search.slice(0, 80) : undefined,
    sort: params.get("sort") === "asc" ? "asc" as const : "desc" as const,
    page: pageValue,
    limit: Math.min(limitValue, 50),
  }
}

async function testFlags(ids: string[]) {
  if (!ids.length) return new Map<string, boolean>()
  const rows = await prisma.$queryRaw<Array<{ id: string; isTest: boolean }>>(
    Prisma.sql`SELECT id, "isTest" FROM "Business" WHERE id IN (${Prisma.join(ids)})`,
  )
  return new Map(rows.map((row) => [row.id, row.isTest]))
}

export async function listQueue(query: ReturnType<typeof parseQueueQuery>) {
  const where: Prisma.BusinessWhereInput = {
    status: query.status,
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
        createdAt: true,
        contactEmail: true,
        locations: { where: { isPrimary: true }, select: { city: true, suburb: true }, take: 1 },
      },
    }),
  ])
  const flags = await testFlags(results.map((row) => row.id))
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
      isTest: flags.get(row.id) === true,
      createdAt: row.createdAt.toISOString(),
      contactEmail: row.contactEmail,
      city: row.locations[0]?.city ?? null,
      suburb: row.locations[0]?.suburb ?? null,
    })),
  }
}

async function openDocument(objectKey: string | null, purpose: string, label: string) {
  if (!objectKey || objectKey.startsWith("import/koshersa/")) return null
  const upload = await prisma.documentUpload.findUnique({ where: { objectKey } })
  let url: string | null = null
  try {
    url = await signedDownloadUrl(objectKey)
  } catch (error) {
    console.error(error)
  }
  return {
    purpose,
    label,
    mimeType: upload?.mimeType ?? "application/octet-stream",
    url,
  }
}

export async function getAdminApplication(id: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      industry: true,
      synagogue: true,
      reviewer: { select: { id: true, email: true, role: true } },
      locations: { orderBy: { isPrimary: "desc" } },
      tags: { include: { tag: true } },
      kosherCertification: true,
      auditLogs: { orderBy: { timestamp: "desc" }, include: { adminUser: { select: { email: true } } } },
    },
  })
  if (!business) return null
  const flags = await testFlags([business.id])
  const { statusTokenHash: _statusTokenHash, auditLogs, ...rest } = business
  void _statusTokenHash
  const documents = (
    await Promise.all([
      openDocument(business.cipcDocKey, "CIPC", "CIPC registration"),
      openDocument(business.proofOfAddressKey, "ADDRESS", "Proof of address"),
      openDocument(business.jewishProofDocKey, "JEWISH_PROOF", "Rabbinical verification"),
      openDocument(business.kosherCertification?.certDocKey ?? null, "BETH_DIN", "Beth Din certificate"),
    ])
  ).filter((document): document is NonNullable<typeof document> => document !== null)

  return {
    ...rest,
    isTest: flags.get(business.id) === true,
    createdAt: business.createdAt.toISOString(),
    updatedAt: business.updatedAt.toISOString(),
    approvedAt: business.approvedAt?.toISOString() ?? null,
    documents,
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

export async function getStats() {
  const approved = { status: "APPROVED" as const }
  const [total, pending, approvedCount, requiresInfo, rejected, johannesburg, capeTown, kosher] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.business.count({ where: approved }),
    prisma.business.count({ where: { status: "REQUIRES_INFO" } }),
    prisma.business.count({ where: { status: "REJECTED" } }),
    prisma.business.count({ where: { ...approved, locations: { some: { city: "JOHANNESBURG" } } } }),
    prisma.business.count({ where: { ...approved, locations: { some: { city: "CAPE_TOWN" } } } }),
    prisma.business.count({ where: { ...approved, kosherCertification: { isNot: null } } }),
  ])
  return { total, pending, approved: approvedCount, requiresInfo, rejected, johannesburg, capeTown, kosher }
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
