/*
  Warnings:

  - The values [ATTACK_ENABLED,ATTACK_DISABLED] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('SESSION_STARTED', 'SESSION_ENDED', 'DNS_QUERY', 'DNS_RESPONSE', 'MODE_CHANGED', 'LAB_RESET', 'MITIGATION_POLICY_UPSERTED', 'MITIGATION_ENABLED', 'MITIGATION_DISABLED', 'SPOOF_DETECTED', 'SPOOF_BLOCKED', 'SAFE_RESOLUTION_FORCED', 'ERROR');
ALTER TABLE "Event" ALTER COLUMN "type" TYPE "EventType_new" USING ("type"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "EventType_old";
COMMIT;

-- AlterTable
ALTER TABLE "DnsQuery" ADD COLUMN     "finalAction" TEXT,
ADD COLUMN     "finalAnswer" TEXT;
