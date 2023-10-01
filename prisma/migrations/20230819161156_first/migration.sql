-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "profile" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "temp" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Champion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Champion_name_key" ON "Champion"("name");
