/*
  Warnings:

  - A unique constraint covering the columns `[reset_token]` on the table `PasswordResetRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetRequest_reset_token_key" ON "PasswordResetRequest"("reset_token");
