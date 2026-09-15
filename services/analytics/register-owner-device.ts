import type { Prisma } from "@prisma/client";
import { defaultDeviceName } from "@/lib/analytics/owner-device";

// Called only after password verification, in the same transaction as the session.
export async function registerOwnerDevice(tx: Prisma.TransactionClient, userId: string, visitorKey: string, userAgent: string | null) {
  const existing = await tx.ownerDevice.findUnique({ where: { visitorKey } });
  // Do not transfer a browser identity between accounts.
  if (existing && existing.userId !== userId) throw new Error("Browser belongs to another account");
  const device = await tx.ownerDevice.upsert({
    where: { visitorKey },
    create: { visitorKey, userId, name: defaultDeviceName(userAgent), userAgent },
    update: { lastLoginAt: new Date(), userAgent },
  });
  await tx.ownerLogin.create({ data: { deviceId: device.id } });
}
