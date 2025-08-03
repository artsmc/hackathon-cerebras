-- CreateTable
CREATE TABLE "Policy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "company_name" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "terms_text" TEXT NOT NULL,
    "raw_response" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "policy_id" INTEGER NOT NULL,
    "total_score" INTEGER NOT NULL,
    "letter_grade" TEXT NOT NULL,
    "overall_summary" TEXT NOT NULL,
    "raw_audit_json" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditReport_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "Policy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SectionScore" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "report_id" INTEGER NOT NULL,
    "section_name" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "commentary" TEXT NOT NULL,
    CONSTRAINT "SectionScore_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "AuditReport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSavedReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "report_id" INTEGER NOT NULL,
    "saved_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "display_name" TEXT,
    "notes" TEXT,
    CONSTRAINT "UserSavedReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserSavedReport_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "AuditReport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserSavedReport_user_id_idx" ON "UserSavedReport"("user_id");

-- CreateIndex
CREATE INDEX "UserSavedReport_report_id_idx" ON "UserSavedReport"("report_id");
