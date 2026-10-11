import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Building2, User, MapPin, Zap, Droplets, CheckCircle2, XCircle } from "lucide-react";
import { getAdminPartnerApplication } from "@/services/admin/partner-application.service";
import { getNeighborhoods } from "@/dal";
import { ApplicationReviewActions } from "@/components/admin/applications/application-review-actions";
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
        {/* Applicant Card */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-xs stack gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <User className="size-4 text-primary" />
            <span>{t("applicant")}</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block">Nom :</span>
              <span className="font-semibold text-heading text-sm">{app.contactName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Téléphone :</span>
              <span className="font-mono font-medium text-heading">{app.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Email :</span>
              <span className="text-heading">{app.email}</span>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-xs stack gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <MapPin className="size-4 text-primary" />
            <span>{t("location")}</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block">Quartier :</span>
              <span className="font-semibold text-heading">
                {app.neighborhoodName || app.neighborhoodText || "Non renseigné"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Repère / Adresse :</span>
              <span className="text-heading">{app.addressNote || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities & Infrastructure Card */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-xs stack gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Building2 className="size-4 text-primary" />
          <span>{t("equipment")}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg stack gap-1">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Droplets className="size-3.5 text-blue-500" />
              {t("waterSupply")}
            </span>
            <span className="font-medium text-heading">{app.servicesNote || "Standard"}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg stack gap-1">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Zap className="size-3.5 text-amber-500" />
              {t("electricitySupply")}
            </span>
            <span className="font-medium text-heading">{app.hoursNote || "Standard"}</span>
          </div>
        </div>
        {app.message && (
          <div className="pt-2 border-t border-slate-100 text-xs">
            <span className="text-muted-foreground block mb-1">Message :</span>
            <p className="text-heading italic bg-slate-50/70 p-3 rounded-lg leading-relaxed">
              &quot;{app.message}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Review Section */}
      {app.status === "pending" ? (
        <ApplicationReviewActions
          applicationId={app.id}
          defaultNeighborhoodId={app.neighborhoodId}
          neighborhoods={neighborhoods.map((n) => ({
            id: n.id,
            name: n.name,
          }))}
        />
      ) : (
        <div className="bg-white rounded-xl border border-border p-5 shadow-xs stack gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-heading">
            {app.status === "approved" ? (
              <CheckCircle2 className="size-4 text-emerald-600" />
            ) : (
              <XCircle className="size-4 text-rose-600" />
            )}
            <span>Statut : {statusLabel}</span>
          </div>
          {app.adminNote && (
            <div>
              <span className="text-muted-foreground block">{t("reviewNotes")} :</span>
              <p className="mt-1 text-heading">{app.adminNote}</p>
            </div>
          )}
          {app.createdHouseId && (
            <div className="pt-2">
              <Link
                href={`/admin/houses/${app.createdHouseId}`}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Accéder à l&apos;atelier créé →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
