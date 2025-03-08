/*
  Warnings:

  - The `status` column on the `OutputImage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `ethnicity` on the `Model` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `eyecolor` on the `Model` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ModelTrainingStatusEnum" AS ENUM ('Pending', 'Generated', 'Failed');

-- CreateEnum
CREATE TYPE "EthnicityEnum" AS ENUM ('Indian', 'MiddleEastern', 'Asian', 'Black', 'Hispanic', 'White', 'Other');

-- CreateEnum
CREATE TYPE "EyeColorEnum" AS ENUM ('Black', 'Brown', 'Blue', 'Green', 'Grey');

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "falAiRequestId" TEXT,
ADD COLUMN     "trainingStatus" "ModelTrainingStatusEnum" NOT NULL DEFAULT 'Pending',
ADD COLUMN     "triggerWord" TEXT,
DROP COLUMN "ethnicity",
ADD COLUMN     "ethnicity" "EthnicityEnum" NOT NULL,
DROP COLUMN "eyecolor",
ADD COLUMN     "eyecolor" "EyeColorEnum" NOT NULL;

-- AlterTable
ALTER TABLE "OutputImage" ADD COLUMN     "falAiRequestId" TEXT,
ALTER COLUMN "imageUrl" SET DEFAULT '',
DROP COLUMN "status",
ADD COLUMN     "status" "ModelTrainingStatusEnum" NOT NULL DEFAULT 'Pending';

-- DropEnum
DROP TYPE "EyecolorEnum";

-- DropEnum
DROP TYPE "OutputImageStatusEnum";

-- DropEnum
DROP TYPE "ethnicityEnum";

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputImage" ADD CONSTRAINT "OutputImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
