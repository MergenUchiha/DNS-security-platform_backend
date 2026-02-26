-- CreateEnum
CREATE TYPE "LabMode" AS ENUM ('SAFE', 'ATTACK', 'MITIGATED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SESSION_STARTED', 'SESSION_ENDED', 'DNS_QUERY', 'DNS_RESPONSE', 'ATTACK_ENABLED', 'ATTACK_DISABLED', 'MITIGATION_ENABLED', 'MITIGATION_DISABLED', 'SPOOF_DETECTED', 'SPOOF_BLOCKED', 'SAFE_RESOLUTION_FORCED', 'LAB_RESET', 'ERROR');

-- CreateTable
CREATE TABLE "LabSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "mode" "LabMode" NOT NULL DEFAULT 'SAFE',

    CONSTRAINT "LabSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "EventType" NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "payload" JSONB,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MitigationPolicy" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "allowedIps" TEXT[],
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "MitigationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DnsQuery" (
    "id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "qtype" TEXT NOT NULL,
    "resolver" TEXT NOT NULL,
    "answer" TEXT,
    "ttl" INTEGER,
    "rttMs" INTEGER,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "DnsQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_sessionId_ts_idx" ON "Event"("sessionId", "ts");

-- CreateIndex
CREATE INDEX "Event_type_ts_idx" ON "Event"("type", "ts");

-- CreateIndex
CREATE INDEX "MitigationPolicy_sessionId_domain_idx" ON "MitigationPolicy"("sessionId", "domain");

-- CreateIndex
CREATE INDEX "DnsQuery_sessionId_ts_idx" ON "DnsQuery"("sessionId", "ts");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LabSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MitigationPolicy" ADD CONSTRAINT "MitigationPolicy_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LabSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DnsQuery" ADD CONSTRAINT "DnsQuery_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LabSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
