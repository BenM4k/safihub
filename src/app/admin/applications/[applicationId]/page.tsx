import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { getAdminPartnerApplication } from "@/services/admin/partner-application.service";
import { getNeighborhoods } from "@/dal";
import { ApplicationReviewActions } from "@/components/admin/applications/application-review-actions";
import { ApplicationApplicantCard } from "@/components/admin/applications/detail/application-applicant-card";
import { ApplicationLocationCard } from "@/components/admin/applications/detail/application-location-card";
import { ApplicationEquipmentCard } from "@/components/admin/applications/detail/application-equipment-card";
import { ApplicationApprovedCard } from "@/components/admin/applications/detail/application-approved-card";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface PageProps {
  params: Promise<{
    applicationId: string;
  }>;
}

export default async function AdminApplicationDetailPage({ params }: PageProps) {
  const t = await getTranslations("admin.applications");
  const { applicationId } = await params;

  const [appRes, neighborhoods] = await Promise.all([
    getAdminPartnerApplication(applicationId),
    getNeighborhoods(),
  ]);

  if (!appRes.ok) {
    notFound();
  }

  const app = appRes.value;

  const statusTone =
    app.status === "approved"
      ? ("success" as const)
      : app.status === "rejected"
        ? ("destructive" as const)
        : ("warning" as const);

  const statusLabel =
    app.status === "approved"
      ? t("approved")
      : app.status === "rejected"
        ? t("rejected")
        : t("pending");

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/applications">{t("title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{app.houseName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-8">
            <Link href="/admin/applications" aria-label={t("title")}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-heading">{app.houseName}</h1>
              <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("submittedOn", {
                date: new Date(app.createdAt).toLocaleDateString("fr-FR"),
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ApplicationApplicantCard
          contactName={app.contactName}
          phone={app.phone}
          email={app.email}
        />
        <ApplicationLocationCard
          neighborhoodName={app.neighborhoodName}
          neighborhoodText={app.neighborhoodText}
          addressNote={app.addressNote}
        />
      </div>

      <ApplicationEquipmentCard
        servicesNote={app.servicesNote}
        hoursNote={app.hoursNote}
        message={app.message}
      />

      {app.status === "pending" ? (
        <ApplicationReviewActions
          applicationId={app.id}
          defaultNeighborhoodId={app.neighborhoodId}
          neighborhoods={neighborhoods.map((n) => ({
            id: n.id,
            name: n.name,
          }))}
          applicationEmail={app.email}
          applicationContactName={app.contactName}
          applicationHouseName={app.houseName}
        />
      ) : (
        <ApplicationApprovedCard
          status={app.status}
          statusLabel={statusLabel}
          adminNote={app.adminNote}
          createdHouseId={app.createdHouseId}
          email={app.email}
        />
      )}
    </div>
  );
}
