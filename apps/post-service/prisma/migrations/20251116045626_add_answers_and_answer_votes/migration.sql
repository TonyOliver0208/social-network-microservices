-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "answerId" TEXT,
ALTER COLUMN "postId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_votes" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answer_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "answers_questionId_idx" ON "answers"("questionId");

-- CreateIndex
CREATE INDEX "answers_authorId_idx" ON "answers"("authorId");

-- CreateIndex
CREATE INDEX "answers_isAccepted_idx" ON "answers"("isAccepted");

-- CreateIndex
CREATE INDEX "answer_votes_answerId_idx" ON "answer_votes"("answerId");

-- CreateIndex
CREATE INDEX "answer_votes_userId_idx" ON "answer_votes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "answer_votes_answerId_userId_key" ON "answer_votes"("answerId", "userId");

-- CreateIndex
CREATE INDEX "comments_answerId_idx" ON "comments"("answerId");

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_votes" ADD CONSTRAINT "answer_votes_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
