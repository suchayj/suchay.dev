"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/services/auth-service";

export async function renameOwnerDevice(_: { message: string }, form: FormData) {
  const user = await requireUser();
  const id = String(form.get("id") ?? "");
  const name = String(form.get("name") ?? "").trim();
  if (!name || name.length > 60) return { message: "Use a device name between 1 and 60 characters." };
  try {
    const result = await prisma.ownerDevice.updateMany({ where: { id, userId: user.id }, data: { name } });
    if (!result.count) return { message: "Device not found." };
    revalidatePath("/career");
    return { message: "Device name saved." };
  } catch { return { message: "Could not save the name. Please try again." }; }
}
