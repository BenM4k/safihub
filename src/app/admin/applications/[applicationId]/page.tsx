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
import { Badge } from "@/components/ui/badge";

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

  const statusVariant =
    app.status === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : app.status === "rejected"
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

  const statusLabel =
    app.status === "approved"
      ? t("approved")
      : app.status === "rejected"
        ? t("rejected")
        : t("pending");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/applications"
          className="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-slate-100 transition text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-heading">{app.houseName}</h1>
            <Badge variant="outline" className={statusVariant}>
              {statusLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("submittedOn", {
              date: new Date(app.createdAt).toLocaleDateString("fr-FR"),
            })}
          </p>
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
