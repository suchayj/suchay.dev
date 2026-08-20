"use server";

import { z } from "zod";
import type { ActionState } from "./action-state";
import { requireUser } from "@/services/auth-service";
import { changePassword } from "@/services/profile-service";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"],
});

export async function changePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the password fields." };
  try {
    const result = await changePassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
    if (!result.ok) return { status: "error", message: result.error };
    return { status: "success", message: "Password updated successfully." };
  } catch {
    return { status: "error", message: "Password could not be updated. Please try again." };
  }
}
