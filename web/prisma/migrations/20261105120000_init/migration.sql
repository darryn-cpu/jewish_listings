-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPERADMIN', 'REVIEWER');

-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('CIPC_REGISTERED_COMPANY', 'SOLE_PROPRIETOR', 'PARTNERSHIP', 'TRUST');

-- CreateEnum
CREATE TYPE "BusinessModel" AS ENUM ('B2B', 'B2C', 'BOTH');

-- CreateEnum
CREATE TYPE "OperationalFormat" AS ENUM ('PHYSICAL', 'ONLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "City" AS ENUM ('JOHANNESBURG', 'CAPE_TOWN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING_REVIEW', 'REQUIRES_INFO', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RejectionReason" AS ENUM ('INCOMPLETE_DOCUMENTS', 'OWNERSHIP_UNVERIFIED', 'OUTSIDE_SERVICE_AREA', 'DUPLICATE', 'FAILED_REFERENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentPurpose" AS ENUM ('CIPC', 'ADDRESS', 'JEWISH_PROOF', 'BETH_DIN');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "refCode" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradingName" TEXT,
    "registrationType" "RegistrationType" NOT NULL,
    "cipcNumber" TEXT,
    "cipcDocKey" TEXT,
    "proofOfAddressKey" TEXT NOT NULL,
    "businessModel" "BusinessModel" NOT NULL,
    "operationalFormat" "OperationalFormat" NOT NULL,
    "websiteUrl" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "customDescription" TEXT,
    "jewishOwnershipPercentage" INTEGER NOT NULL,
    "synagogueId" TEXT,
    "synagogueOtherName" TEXT,
    "rabbiContactName" TEXT NOT NULL,
    "rabbiContactPhone" TEXT NOT NULL,
    "jewishProofDocKey" TEXT NOT NULL,
    "offersDiscount" BOOLEAN NOT NULL DEFAULT false,
    "discountDetails" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewerId" TEXT,
    "reviewerNotes" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" "RejectionReason",
    "consentAccepted" BOOLEAN NOT NULL,
    "accuracyDeclared" BOOLEAN NOT NULL,
    "statusTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessLocation" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "branchName" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "suburb" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "postalCode" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BusinessLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KosherCertification" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "bethDinCertNumber" TEXT NOT NULL,
    "certDocKey" TEXT NOT NULL,
    "allowsBulkOrdering" BOOLEAN NOT NULL DEFAULT false,
    "meat" BOOLEAN NOT NULL DEFAULT false,
    "dairy" BOOLEAN NOT NULL DEFAULT false,
    "chalavYisrael" BOOLEAN NOT NULL DEFAULT false,
    "parev" BOOLEAN NOT NULL DEFAULT false,
    "mehadrin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KosherCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,

    CONSTRAINT "ServiceTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessTag" (
    "businessId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BusinessTag_pkey" PRIMARY KEY ("businessId","tagId")
);

-- CreateTable
CREATE TABLE "Synagogue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "rabbiName" TEXT,

    CONSTRAINT "Synagogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentUpload" (
    "id" TEXT NOT NULL,
    "purpose" "DocumentPurpose" NOT NULL,
    "objectKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "previousStatus" "ApplicationStatus" NOT NULL,
    "newStatus" "ApplicationStatus" NOT NULL,
    "comment" TEXT,
    "reasonCode" "RejectionReason",
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefSequence" (
    "year" INTEGER NOT NULL,
    "lastValue" INTEGER NOT NULL,

    CONSTRAINT "RefSequence_pkey" PRIMARY KEY ("year")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Business_refCode_key" ON "Business"("refCode");

-- CreateIndex
CREATE INDEX "Business_status_idx" ON "Business"("status");

-- CreateIndex
CREATE INDEX "Business_createdAt_idx" ON "Business"("createdAt");

-- CreateIndex
CREATE INDEX "Business_industryId_idx" ON "Business"("industryId");

-- CreateIndex
CREATE INDEX "Business_contactEmail_idx" ON "Business"("contactEmail");

-- CreateIndex
CREATE INDEX "BusinessLocation_businessId_idx" ON "BusinessLocation"("businessId");

-- CreateIndex
CREATE INDEX "BusinessLocation_city_idx" ON "BusinessLocation"("city");

-- CreateIndex
CREATE UNIQUE INDEX "KosherCertification_businessId_key" ON "KosherCertification"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "Industry"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTag_slug_key" ON "ServiceTag"("slug");

-- CreateIndex
CREATE INDEX "ServiceTag_industryId_idx" ON "ServiceTag"("industryId");

-- CreateIndex
CREATE INDEX "BusinessTag_tagId_idx" ON "BusinessTag"("tagId");

-- CreateIndex
CREATE INDEX "Synagogue_city_idx" ON "Synagogue"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Synagogue_name_city_key" ON "Synagogue"("name", "city");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentUpload_objectKey_key" ON "DocumentUpload"("objectKey");

-- CreateIndex
CREATE INDEX "DocumentUpload_purpose_idx" ON "DocumentUpload"("purpose");

-- CreateIndex
CREATE INDEX "AuditLog_businessId_idx" ON "AuditLog"("businessId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_synagogueId_fkey" FOREIGN KEY ("synagogueId") REFERENCES "Synagogue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessLocation" ADD CONSTRAINT "BusinessLocation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KosherCertification" ADD CONSTRAINT "KosherCertification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Industry" ADD CONSTRAINT "Industry_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Industry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTag" ADD CONSTRAINT "ServiceTag_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTag" ADD CONSTRAINT "BusinessTag_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTag" ADD CONSTRAINT "BusinessTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ServiceTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- The Next.js server connects as the database owner and bypasses row level security.
-- These tables stay in public for Prisma, with the Data API denied by default.
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Business" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessLocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KosherCertification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Industry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Synagogue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentUpload" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefSequence" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "AdminUser" FROM anon, authenticated;
    REVOKE ALL ON TABLE "Business" FROM anon, authenticated;
    REVOKE ALL ON TABLE "BusinessLocation" FROM anon, authenticated;
    REVOKE ALL ON TABLE "KosherCertification" FROM anon, authenticated;
    REVOKE ALL ON TABLE "Industry" FROM anon, authenticated;
    REVOKE ALL ON TABLE "ServiceTag" FROM anon, authenticated;
    REVOKE ALL ON TABLE "BusinessTag" FROM anon, authenticated;
    REVOKE ALL ON TABLE "Synagogue" FROM anon, authenticated;
    REVOKE ALL ON TABLE "DocumentUpload" FROM anon, authenticated;
    REVOKE ALL ON TABLE "AuditLog" FROM anon, authenticated;
    REVOKE ALL ON TABLE "RefSequence" FROM anon, authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
  END IF;
END $$;
