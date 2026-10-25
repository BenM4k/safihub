import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAdminCourierDetail } from "@/services/admin";
import { CourierDetailTabs } from "@/components/admin/couriers/courier-detail-tabs";

export default async function AdminCourierDetailPage({
  params,
}: {
  params: Promise<{ courierId: string }>;
}) {
  const { courierId } = await params;
  const t = await getTranslations("admin.couriers");

  const res = await getAdminCourierDetail(courierId);
  if (!res.ok) {
    notFound();
  }

  const data = res.value;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/admin/couriers" className="hover:text-heading">
              {t("title")}
            </Link>
            <span>/</span>
            <span className="text-heading font-semibold">{data.courier.name}</span>
          </div>
          <h1 className="text-2xl font-black text-heading tracking-tight">
            {data.courier.name}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.courier.email} • {data.courier.contactPhone || "—"}
          </p>
        </div>
      </div>

      <CourierDetailTabs data={data} />
    </div>
  );
}
