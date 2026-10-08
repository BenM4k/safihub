"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { assignMissionToCourier } from "@/services/admin";

export async function assignMissionAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const missionId = String(formData.get("missionId"));
  const orderId = String(formData.get("orderId"));
  const courierId = String(formData.get("courierId"));
  const customerZoneId = formData.get("customerZoneId")
    ? String(formData.get("customerZoneId"))
    : undefined;
  const houseZoneId = formData.get("houseZoneId")
    ? String(formData.get("houseZoneId"))
    : undefined;

  const res = await assignMissionToCourier({
    missionId,
    orderId,
    courierId,
    adminId: auth.value.user.id,
    customerZoneId,
    houseZoneId,
  });

  if (res.ok) {
    revalidatePath("/admin/dispatch");
    revalidatePath(`/admin/orders/${orderId}`);
  }

  return res;
}
