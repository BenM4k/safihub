import "server-only";
import { hashPassword } from "better-auth/crypto";
import { err, ok, type Result } from "@/lib/result";
import { runAfterSafe } from "@/lib/after-safe";
import { sanitizeServiceError } from "@/lib/service-errors";
import {
  approveHouseApplicationTransaction,
  getHouseApplicationById,
  isHouseSlugAvailable,
  listHouseApplications,
  listHouseApplicationsPaginated,
  PartnerApplicationApprovalError,
  updateHouseApplication,
  type HouseApplicationRecord,
  type PaginatedHouseApplicationsResult,
} from "@/dal/house-application.dal";
import type { AdminApplicationsQueryParams } from "@/lib/admin-applications-query";
import { getNeighborhoods } from "@/dal/coverage.dal";
import { generateUniqueSlug } from "@/lib/slug";
import { generateSecurePassword } from "@/lib/user-guardrails";
import {
  getAppBaseUrl,
  queueEmailNotification,
  sendPartnerInvitationEmail,
} from "@/services/email";
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
      sanitizeServiceError(
        error,
        "Failed to load partner applications",
        "listAdminPartnerApplications"
      )
    );
  }
}

export async function listAdminPartnerApplicationsPaginated(
  query: AdminApplicationsQueryParams
): Promise<Result<PaginatedHouseApplicationsResult>> {
  try {
    const data = await listHouseApplicationsPaginated({
      status: query.status === "all" ? undefined : query.status,
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
    });
    return ok(data);
  } catch (error) {
    return err(
      sanitizeServiceError(
        error,
        "Failed to load partner applications",
        "listAdminPartnerApplicationsPaginated"
      )
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
  customPassword?: string;
}): Promise<
  Result<{
    houseId: string;
    houseSlug: string;
    userId: string;
    temporaryPassword: string;
    isNewAccount: boolean;
    passwordApplied: boolean;
  }>
> {
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

    // Generate or validate temporary password
    const plainPassword =
      params.customPassword && params.customPassword.trim().length >= 8
        ? params.customPassword.trim()
        : generateSecurePassword();

    const hashedPassword = await hashPassword(plainPassword);

    // Execute atomic transaction with credential setup
    const result = await approveHouseApplicationTransaction({
      applicationId: application.id,
      adminUserId: params.adminUserId,
      adminNote: params.adminNote ?? null,
      hashedPassword,
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

    const passwordApplied = result.passwordApplied ?? result.isNewAccount;

    // Queue idempotent background invitation email with direct login link and temporary credentials
    const baseUrl = getAppBaseUrl();
    const inviteUrl = `${baseUrl}/login`;

    // Send credential-bearing invitation directly outside queueEmailNotification
    // to prevent storing plaintext credentials in the durable Inngest event store.
    runAfterSafe(async () => {
      await sendPartnerInvitationEmail({
        email: application.email,
        contactName: application.contactName,
        houseName: application.houseName,
        inviteUrl,
        temporaryPassword: passwordApplied ? plainPassword : undefined,
      });
    });

    return ok({
      houseId: result.houseId,
      houseSlug: result.houseSlug,
      userId: result.userId,
      temporaryPassword: passwordApplied ? plainPassword : "",
      isNewAccount: result.isNewAccount,
      passwordApplied,
    });
  } catch (error) {
    if (error instanceof PartnerApplicationApprovalError) {
      return err(error.message);
    }
    return err(
      sanitizeServiceError(
        error,
        "Failed to approve partner application",
        "approvePartnerApplication"
      )
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

    runAfterSafe(async () => {
      await queueEmailNotification({
        kind: "partner_application_rejected",
        applicationId: application.id,
        email: application.email,
        contactName: application.contactName,
        houseName: application.houseName,
        adminNote: params.adminNote.trim(),
      });
    });

    return ok(undefined);
  } catch (error) {
    return err(
      sanitizeServiceError(
        error,
        "Failed to reject partner application",
        "rejectPartnerApplication"
      )
    );
  }
}
