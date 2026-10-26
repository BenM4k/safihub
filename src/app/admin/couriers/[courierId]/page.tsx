import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAdminCourierDetail } from "@/services/admin";
import { CourierDetailTabs } from "@/components/admin/couriers/courier-detail-tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin/couriers">{t("title")}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{data.courier.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
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

