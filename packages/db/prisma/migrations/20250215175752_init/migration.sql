-- CreateEnum
CREATE TYPE "ModelTypeEnum" AS ENUM ('Man', 'Women', 'Dog', 'Cat', 'Others');

-- CreateEnum
CREATE TYPE "ethnicityEnum" AS ENUM ('Indian', 'MiddleEastern', 'Asian', 'Black', 'Hispanic', 'White', 'Other');

-- CreateEnum
CREATE TYPE "EyecolorEnum" AS ENUM ('Black', 'Brown', 'Blue', 'Green', 'Grey');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profilePicture" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ModelTypeEnum" NOT NULL,
    "age" INTEGER NOT NULL,
    "ethnicity" "ethnicityEnum" NOT NULL,
    "eyecolor" "EyecolorEnum" NOT NULL,
    "bald" BOOLEAN NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingImages" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,

    CONSTRAINT "TrainingImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutputImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OutputImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Packs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackPrompts" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "packId" TEXT NOT NULL,

    CONSTRAINT "PackPrompts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrainingImages" ADD CONSTRAINT "TrainingImages_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputImage" ADD CONSTRAINT "OutputImage_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackPrompts" ADD CONSTRAINT "PackPrompts_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
