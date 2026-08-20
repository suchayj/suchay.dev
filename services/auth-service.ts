import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import {
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  createSessionToken,
  hashSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";

export type AuthUser = { id: string; email: string };

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
  return { id: user.id, email: user.email } satisfies AuthUser;
}

export async function startSession(userId: string) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await prisma.session.create({ data: { userId, tokenHash: hashSessionToken(token), expiresAt } });
  await setSessionCookie(token, expiresAt);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const session = await prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!session) return null;
    if (session.expiresAt <= new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }
    return session.user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function endCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } }).catch(() => undefined);
  }
}
