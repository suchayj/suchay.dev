import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { requireUser } from "@/services/auth-service";
import { OWNER_VISITOR_COOKIE } from "@/lib/analytics/owner-device";

export async function getOwnerDevices() {
  const user = await requireUser();
  const currentKey = (await cookies()).get(OWNER_VISITOR_COOKIE)?.value;
  const devices = await prisma.ownerDevice.findMany({ where: { userId: user.id }, orderBy: { lastLoginAt: "desc" } });
  const logins = await prisma.ownerLogin.findMany({ where: { device: { userId: user.id } }, include: { device: { select: { name: true, visitorKey: true } } }, orderBy: [{ occurredAt: "desc" }, { id: "desc" }], take: 30 });
  return { devices: devices.map(({ id, name, lastLoginAt, visitorKey }) => ({ id, name, lastLoginAt, current: visitorKey === currentKey })), logins: logins.map(({ id, occurredAt, device }) => ({ id, occurredAt, name: device.name, current: device.visitorKey === currentKey })) };
}
