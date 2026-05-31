-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "account" VARCHAR(64),
    "nickname" VARCHAR(64),
    "avatar" VARCHAR(512),
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_account_key" ON "users"("account");
