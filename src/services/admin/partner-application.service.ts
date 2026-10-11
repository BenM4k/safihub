import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  approveHouseApplicationTransaction,
  getHouseApplicationById,
  isHouseSlugAvailable,
  listHouseApplications,
  updateHouseApplication,
  type HouseApplicationRecord,
} from "@/dal/house-application.dal";
import { getNeighborhoods } from "@/dal/coverage.dal";
import { generateUniqueSlug } from "@/lib/slug";
import { sendPartnerInvitationEmail } from "@/services/email";
import type { ApplicationStatus } from "@/services/db/schema";

export async function listAdminPartnerApplications(params?: {
  status?: ApplicationStatus;
  limit?: number;
  offset?: number;
}): Promise<Result<{ applications: HouseApplicationRecord[]; total: number }>> {
  try {
    const data = await listHouseApplications(params);
    return ok(data);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Failed to load partner applications"
    );
  }
}

export async function getAdminPartnerApplication(
  id: string
): Promise<Result<HouseApplicationRecord>> {
  try {
    const application = await getHouseApplicationById(id);
    if (!application) {
      return err("Partner application not found");
    }
    return ok(application);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Failed to load partner application"
    );
  }
}

export async function approvePartnerApplication(params: {
  applicationId: string;
  adminUserId: string;
  neighborhoodId?: string;
  adminNote?: string | null;
}): Promise<Result<{ houseId: string; houseSlug: string; userId: string }>> {
  try {
    const application = await getHouseApplicationById(params.applicationId);
    if (!application) {
      return err("Partner application not found");
    }

    if (application.status !== "pending") {
      return err(
        `Application is already ${application.status} and cannot be approved again`
      );
    }

    // Resolve neighborhood ID (from params, application, or fallback)
    let neighborhoodId =
      params.neighborhoodId || application.neighborhoodId;

    if (!neighborhoodId) {
      const allNeighborhoods = await getNeighborhoods();
      if (allNeighborhoods.length === 0) {
        return err(
          "No neighborhoods exist in the system to assign to this house"
        );
      }
      neighborhoodId = allNeighborhoods[0]!.id;
    }

    // Generate unique slug for house
    const slug = await generateUniqueSlug(application.houseName, async (s) => {
      const available = await isHouseSlugAvailable(s);
      return !available; // taken if not available
    });

    const newUserId = `usr_house_${crypto.randomUUID().slice(0, 8)}`;

    // Execute atomic transaction
    const result = await approveHouseApplicationTransaction({
      applicationId: application.id,
      adminUserId: params.adminUserId,
      adminNote: params.adminNote ?? null,
      house: {
        name: application.houseName,
        slug,
        neighborhoodId,
        addressNote: application.addressNote,
        contactPhone: application.phone,
      },
      user: {
        id: newUserId,
        name: application.contactName,
        email: application.email,
        contactPhone: application.phone,
      },
    });

    // Send invitation email with password setup URL
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/forgot-password?email=${encodeURIComponent(application.email)}`;

    await sendPartnerInvitationEmail({
      email: application.email,
      contactName: application.contactName,
      houseName: application.houseName,
      inviteUrl,
    }).catch((err) => {
      console.error("[approvePartnerApplication] Email dispatch warning:", err);
    });

    return ok(result);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Failed to approve partner application"
    );
  }
}

export async function rejectPartnerApplication(params: {
  applicationId: string;
  adminUserId: string;
  adminNote: string;
}): Promise<Result<void>> {
  try {
    if (!params.adminNote?.trim()) {
      return err("A reason or note is required when rejecting an application");
    }

    const application = await getHouseApplicationById(params.applicationId);
    if (!application) {
      return err("Partner application not found");
    }

    if (application.status !== "pending") {
      return err(
        `Application is already ${application.status} and cannot be rejected`
      );
    }

    await updateHouseApplication(params.applicationId, {
      status: "rejected",
      adminNote: params.adminNote.trim(),
      reviewedBy: params.adminUserId,
      reviewedAt: new Date(),
    });

    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Failed to reject partner application"
    );
  }
}
