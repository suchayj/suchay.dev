"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/services/auth-service";
import { deleteRecordedEnquiry } from "@/services/voice-recordings";
import { endVoice } from "@/services/voice-runtime";

export async function updateEnquiry(_: { message: string }, form: FormData) {
  await requireUser();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!["NEW", "CONTACTED", "CLOSED"].includes(status) || !id) return { message: "Choose a valid status." };
  try {
    await prisma.voiceEnquiry.update({ where: { id }, data: { followUp: status } });
    revalidatePath("/career/enquiries");
    return { message: "Follow-up status saved." };
  } catch { return { message: "Couldn’t save. Please try again." }; }
}
export async function deleteEnquiry(_: { message: string }, form: FormData) {
  await requireUser();
  const id = String(form.get("id") ?? "");
  if (!id || form.get("confirm") !== "on") return { message: "Confirm deletion first." };
  try {
    await endVoice(id, "INTERRUPTED");
    await deleteRecordedEnquiry(id);
    revalidatePath("/career/enquiries");
    return { message: "Enquiry deleted." };
  } catch { return { message: "Couldn’t delete. Please try again." }; }
}
