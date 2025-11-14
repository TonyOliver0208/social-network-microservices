-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UP', 'DOWN');

-- CreateTable
CREATE TABLE "question_votes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_questions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listName" TEXT DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_votes_postId_idx" ON "question_votes"("postId");

-- CreateIndex
CREATE INDEX "question_votes_userId_idx" ON "question_votes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "question_votes_postId_userId_key" ON "question_votes"("postId", "userId");

-- CreateIndex
CREATE INDEX "favorite_questions_postId_idx" ON "favorite_questions"("postId");

-- CreateIndex
CREATE INDEX "favorite_questions_userId_idx" ON "favorite_questions"("userId");

-- CreateIndex
CREATE INDEX "favorite_questions_userId_listName_idx" ON "favorite_questions"("userId", "listName");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_questions_postId_userId_key" ON "favorite_questions"("postId", "userId");

-- AddForeignKey
ALTER TABLE "question_votes" ADD CONSTRAINT "question_votes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_questions" ADD CONSTRAINT "favorite_questions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
