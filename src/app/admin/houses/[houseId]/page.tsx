import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { getAdminHouseDetail } from "@/services/admin";
import { HouseDetailTabs } from "@/components/admin/houses/house-detail-tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export default async function AdminHouseDetailPage({
  params,
}: {
  params: Promise<{ houseId: string }>;
}) {
  const { houseId } = await params;
  const t = await getTranslations("admin.houses");

  const res = await getAdminHouseDetail(houseId);
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
                  <Link href="/admin/houses">{t("title")}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{data.house.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-black text-heading tracking-tight">
            {data.house.name}
          </h1>
        </div>

        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href={`/partner/${data.house.slug}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            <span>{t("openDelegatedView")}</span>
          </Link>
        </Button>
      </div>

      <HouseDetailTabs data={data} />
    </div>
  );
}

