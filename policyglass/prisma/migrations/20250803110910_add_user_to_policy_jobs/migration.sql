/*
  Warnings:

  - Added the required column `user_id` to the `PolicyJob` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PolicyJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "job_type" TEXT NOT NULL DEFAULT 'POLICY_ANALYSIS',
    "source_url" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
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
    CONSTRAINT "PolicyJob_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PolicyJob_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "Policy" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PolicyJob_audit_report_id_fkey" FOREIGN KEY ("audit_report_id") REFERENCES "AuditReport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PolicyJob" ("audit_completed_at", "audit_confidence", "audit_error", "audit_report_id", "audit_started_at", "audit_status", "created_at", "expires_at", "id", "job_type", "policy_id", "progress_percentage", "research_completed_at", "research_confidence", "research_error", "research_started_at", "research_status", "source_url", "status", "updated_at") SELECT "audit_completed_at", "audit_confidence", "audit_error", "audit_report_id", "audit_started_at", "audit_status", "created_at", "expires_at", "id", "job_type", "policy_id", "progress_percentage", "research_completed_at", "research_confidence", "research_error", "research_started_at", "research_status", "source_url", "status", "updated_at" FROM "PolicyJob";
DROP TABLE "PolicyJob";
ALTER TABLE "new_PolicyJob" RENAME TO "PolicyJob";
CREATE INDEX "PolicyJob_status_idx" ON "PolicyJob"("status");
CREATE INDEX "PolicyJob_created_at_idx" ON "PolicyJob"("created_at");
CREATE INDEX "PolicyJob_expires_at_idx" ON "PolicyJob"("expires_at");
CREATE INDEX "PolicyJob_source_url_idx" ON "PolicyJob"("source_url");
CREATE INDEX "PolicyJob_user_id_idx" ON "PolicyJob"("user_id");
CREATE INDEX "PolicyJob_user_id_created_at_idx" ON "PolicyJob"("user_id", "created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
