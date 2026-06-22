-- AlterTable: add fields that were added to schema.prisma after the initial migration
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredBy"   TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken"        TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry"  TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");
CREATE UNIQUE INDEX IF NOT EXISTS "User_resetToken_key"   ON "User"("resetToken");
