"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "./action-state";
import { clearSessionCookie } from "@/lib/auth/session";
import { authenticate, endCurrentSession, startSession } from "@/services/auth-service";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { status: "error", message: "Enter a valid email and password." };
  try {
    const user = await authenticate(parsed.data.email, parsed.data.password);
    if (!user) return { status: "error", message: "Email or password is incorrect." };
    await startSession(user.id);
  } catch {
    return { status: "error", message: "CareerOS is temporarily unavailable. Please try again." };
  }
  redirect("/career");
}

export async function logoutAction() {
  await endCurrentSession();
  await clearSessionCookie();
  redirect("/login");
}
