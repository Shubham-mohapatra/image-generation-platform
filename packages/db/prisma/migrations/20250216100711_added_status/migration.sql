/*
  Warnings:

  - Added the required column `prompt` to the `OutputImage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OutputImageStatusEnum" AS ENUM ('Pending', 'Generated', 'Failed');

-- AlterTable
ALTER TABLE "OutputImage" ADD COLUMN     "prompt" TEXT NOT NULL,
ADD COLUMN     "status" "OutputImageStatusEnum" NOT NULL DEFAULT 'Pending';
