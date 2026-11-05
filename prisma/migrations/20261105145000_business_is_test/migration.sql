ALTER TABLE "Business" ADD COLUMN "isTest" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Business"
SET "isTest" = true
WHERE "legalName" IN (
  'Goldsteins Kosher Deli Proprietary Limited',
  'Rivka Levy',
  'Cohen and Kaplan Attorneys',
  'The Kaplan Family Trust',
  'Shapiro Textiles Proprietary Limited'
);
