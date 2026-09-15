import { registerOwnerDevice } from "@/services/analytics/register-owner-device";
import { randomUUID } from "node:crypto";
import { OWNER_VISITOR_COOKIE, validVisitorKey } from "@/lib/analytics/owner-device";
import { headers } from "next/headers";
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
  const cookieStore = await cookies();
  const visitorKey = validVisitorKey(cookieStore.get(OWNER_VISITOR_COOKIE)?.value) ?? randomUUID();
  const userAgent = (await headers()).get("user-agent")?.slice(0, 500) ?? null;
  await prisma.$transaction(async (tx) => {
    await tx.session.create({ data: { userId, tokenHash: hashSessionToken(token), expiresAt } });
    await registerOwnerDevice(tx, userId, visitorKey, userAgent);
  });
  cookieStore.set(OWNER_VISITOR_COOKIE, visitorKey, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
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
