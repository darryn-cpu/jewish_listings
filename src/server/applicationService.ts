import "server-only"
import { randomUUID } from "node:crypto"
import type { DocumentPurpose, Prisma } from "@prisma/client"
import { ApiError } from "@/server/errors"
import { prisma } from "@/server/prisma"
import { receiptEmail } from "@/server/mailTemplates"
import { sendMail } from "@/server/mailer"
import { formatRefCode } from "@/server/refCode"
import type { ApplicationInput } from "@/server/schemas"
import { assertStoredObject, createUploadTarget } from "@/server/storage"
import { createStatusToken } from "@/server/token"
import type { presignSchema } from "@/server/schemas"
import type { z } from "zod"

type PresignInput = z.infer<typeof presignSchema>

export async function createPresignedUpload(input: PresignInput) {
  const objectKey = `${input.purpose.toLowerCase()}/${randomUUID()}`
  const upload = await prisma.documentUpload.create({
    data: {
      purpose: input.purpose,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      objectKey,
    },
  })
  try {
    const target = await createUploadTarget(objectKey)
    return {
      uploadId: upload.id,
      objectKey,
      signedUrl: target.signedUrl,
      token: target.token,
    }
  } catch (error) {
    await prisma.documentUpload.delete({ where: { id: upload.id } }).catch(() => undefined)
    throw error
  }
}

async function requireUpload(id: string, purpose: DocumentPurpose) {
  const upload = await prisma.documentUpload.findUnique({ where: { id } })
  if (!upload || upload.consumedAt) {
    throw new ApiError(400, "UPLOAD_INVALID", "One of the documents is missing or has already been submitted.")
  }
  if (upload.purpose !== purpose) {
    throw new ApiError(400, "UPLOAD_PURPOSE", "A file was uploaded for the wrong document.")
  }
  await assertStoredObject(upload.objectKey)
  return upload
}

async function consumeUpload(tx: Prisma.TransactionClient, id: string, purpose: DocumentPurpose) {
  const updated = await tx.documentUpload.updateMany({
    where: { id, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  })
  if (updated.count !== 1) {
    throw new ApiError(409, "UPLOAD_CONSUMED", "One of the documents was already submitted.")
  }
  const upload = await tx.documentUpload.findUniqueOrThrow({ where: { id } })
  return upload.objectKey
}

export async function submitApplication(input: ApplicationInput) {
  const industry = await prisma.industry.findUnique({
    where: { id: input.categorization.industryId },
    include: { tags: { select: { id: true } } },
  })
  if (!industry) {
    throw new ApiError(400, "INDUSTRY_NOT_FOUND", "Choose an industry from the list.")
  }
  const allowedTags = new Set(industry.tags.map((tag) => tag.id))
  if (input.categorization.tagIds.some((tagId) => !allowedTags.has(tagId))) {
    throw new ApiError(400, "TAG_MISMATCH", "Each service tag must belong to the chosen industry.")
  }
  if (input.ownership.synagogueId) {
    const synagogue = await prisma.synagogue.findUnique({ where: { id: input.ownership.synagogueId } })
    if (!synagogue) throw new ApiError(400, "SYNAGOGUE_NOT_FOUND", "Choose a synagogue from the list.")
  }

  await requireUpload(input.identity.proofOfAddressUploadId, "ADDRESS")
  await requireUpload(input.ownership.jewishProofUploadId, "JEWISH_PROOF")
  if (input.identity.cipcUploadId) await requireUpload(input.identity.cipcUploadId, "CIPC")
  if (input.kosher) await requireUpload(input.kosher.certUploadId, "BETH_DIN")

  const { token, hash } = createStatusToken()
  const locations = input.operations.locations.map((location, index) => ({
    ...location,
    isPrimary: location.isPrimary || (input.operations.locations.every((item) => !item.isPrimary) && index === 0),
  }))

  const business = await prisma.$transaction(async (tx) => {
    const year = new Date().getFullYear()
    const rows = await tx.$queryRaw<{ lastValue: number }[]>`
      INSERT INTO "RefSequence" ("year", "lastValue")
      VALUES (${year}, 1)
      ON CONFLICT ("year") DO UPDATE
      SET "lastValue" = "RefSequence"."lastValue" + 1
      RETURNING "lastValue"
    `
    const refCode = formatRefCode(year, rows[0]?.lastValue ?? 1)
    const cipcDocKey = input.identity.cipcUploadId ? await consumeUpload(tx, input.identity.cipcUploadId, "CIPC") : null
    const proofOfAddressKey = await consumeUpload(tx, input.identity.proofOfAddressUploadId, "ADDRESS")
    const jewishProofDocKey = await consumeUpload(tx, input.ownership.jewishProofUploadId, "JEWISH_PROOF")
    const certDocKey = input.kosher ? await consumeUpload(tx, input.kosher.certUploadId, "BETH_DIN") : null

    return tx.business.create({
      data: {
        refCode,
        legalName: input.identity.legalName,
        tradingName: input.identity.tradingName,
        registrationType: input.identity.registrationType,
        cipcNumber: input.identity.cipcNumber,
        cipcDocKey,
        proofOfAddressKey,
        businessModel: input.operations.businessModel,
        operationalFormat: input.operations.operationalFormat,
        websiteUrl: input.operations.websiteUrl,
        contactName: input.operations.contactName,
        contactPhone: input.operations.contactPhone,
        contactEmail: input.operations.contactEmail,
        industryId: input.categorization.industryId,
        customDescription: input.categorization.customDescription,
        jewishOwnershipPercentage: input.ownership.jewishOwnershipPercentage,
        synagogueId: input.ownership.synagogueId,
        synagogueOtherName: input.ownership.synagogueOtherName,
        rabbiContactName: input.ownership.rabbiContactName,
        rabbiContactPhone: input.ownership.rabbiContactPhone,
        jewishProofDocKey,
        offersDiscount: input.legal.offersDiscount,
        discountDetails: input.legal.discountDetails,
        consentAccepted: input.legal.consentAccepted,
        accuracyDeclared: input.legal.accuracyDeclared,
        statusTokenHash: hash,
        status: "PENDING_REVIEW",
        locations: { create: locations },
        tags: { create: input.categorization.tagIds.map((tagId) => ({ tagId })) },
        kosherCertification: input.kosher && certDocKey
          ? {
              create: {
                brandName: input.kosher.brandName,
                bethDinCertNumber: input.kosher.bethDinCertNumber,
                certDocKey,
                allowsBulkOrdering: input.kosher.allowsBulkOrdering,
                meat: input.kosher.meat,
                dairy: input.kosher.dairy,
                chalavYisrael: input.kosher.chalavYisrael,
                parev: input.kosher.parev,
                mehadrin: input.kosher.mehadrin,
              },
            }
          : undefined,
      },
    })
  })

  const statusUrl = `${process.env.APP_URL || "http://localhost:3000"}/apply?view=status&ref=${encodeURIComponent(business.refCode)}&token=${encodeURIComponent(token)}`
  const message = receiptEmail({ refCode: business.refCode, statusUrl })
  const email = await sendMail({ to: business.contactEmail, ...message }).catch((error) => {
    console.error(error)
    return { sent: false as const }
  })

  return { refCode: business.refCode, statusToken: token, emailSent: email.sent }
}
