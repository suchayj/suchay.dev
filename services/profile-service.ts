import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return { ok: false as const, error: "Current password is incorrect." };
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { ok: true as const };
}
