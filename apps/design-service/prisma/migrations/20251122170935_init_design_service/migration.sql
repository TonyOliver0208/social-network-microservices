-- CreateTable
CREATE TABLE "designs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled Design',
    "canvasData" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "designs_userId_idx" ON "designs"("userId");

-- CreateIndex
CREATE INDEX "designs_category_idx" ON "designs"("category");

-- CreateIndex
CREATE INDEX "designs_updatedAt_idx" ON "designs"("updatedAt");
