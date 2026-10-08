"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/services/auth";
import { err, type Result } from "@/lib/result";
import { assignMissionToCourier } from "@/services/admin";

const assignMissionSchema = z.object({
  missionId: z.string().uuid("Mission invalide"),
  courierId: z.string().min(1, "Coursier requis"),
  orderId: z.string().uuid().optional(),
});

export async function assignMissionAction(formData: FormData): Promise<Result<unknown>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = assignMissionSchema.safeParse({
    missionId: formData.get("missionId"),
    courierId: formData.get("courierId"),
    orderId: formData.get("orderId") || undefined,
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const res = await assignMissionToCourier({
    missionId: parsed.data.missionId,
    orderId: parsed.data.orderId,
    courierId: parsed.data.courierId,
    adminId: auth.value.user.id,
  });

  if (res.ok) {
    revalidatePath("/admin/dispatch");
    if (parsed.data.orderId) {
      revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    }
  }

  return res;
}
