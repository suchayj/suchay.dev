CREATE TABLE "OwnerDevice" (
 "id" TEXT NOT NULL, "visitorKey" TEXT NOT NULL, "userId" TEXT NOT NULL,
 "name" TEXT NOT NULL, "userAgent" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "OwnerDevice_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "OwnerDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "OwnerDevice_visitorKey_key" ON "OwnerDevice"("visitorKey");
CREATE INDEX "OwnerDevice_userId_idx" ON "OwnerDevice"("userId");
CREATE TABLE "OwnerLogin" (
 "id" TEXT NOT NULL, "deviceId" TEXT NOT NULL, "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "OwnerLogin_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "OwnerLogin_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "OwnerDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "OwnerLogin_deviceId_occurredAt_idx" ON "OwnerLogin"("deviceId", "occurredAt");
