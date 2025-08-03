-- CreateTable
CREATE TABLE "PolicyJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "job_type" TEXT NOT NULL DEFAULT 'POLICY_ANALYSIS',
    "source_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "research_status" TEXT NOT NULL DEFAULT 'PENDING',
    "research_started_at" DATETIME,
    "research_completed_at" DATETIME,
    "research_error" TEXT,
    "research_confidence" REAL,
    "policy_id" INTEGER,
    "audit_status" TEXT NOT NULL DEFAULT 'PENDING',
    "audit_started_at" DATETIME,
    "audit_completed_at" DATETIME,
    "audit_error" TEXT,
    "audit_confidence" REAL,
    "audit_report_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "expires_at" DATETIME NOT NULL,
    CONSTRAINT "PolicyJob_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "Policy" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PolicyJob_audit_report_id_fkey" FOREIGN KEY ("audit_report_id") REFERENCES "AuditReport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PolicyJob_status_idx" ON "PolicyJob"("status");

-- CreateIndex
CREATE INDEX "PolicyJob_created_at_idx" ON "PolicyJob"("created_at");

-- CreateIndex
CREATE INDEX "PolicyJob_expires_at_idx" ON "PolicyJob"("expires_at");

-- CreateIndex
CREATE INDEX "PolicyJob_source_url_idx" ON "PolicyJob"("source_url");
