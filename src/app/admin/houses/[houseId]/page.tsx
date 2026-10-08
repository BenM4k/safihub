import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminHouseDetail } from "@/services/admin";
import { HouseDetailTabs } from "@/components/admin/houses/house-detail-tabs";

export default async function AdminHouseDetailPage({
  params,
}: {
  params: Promise<{ houseId: string }>;
}) {
  const { houseId } = await params;

  const res = await getAdminHouseDetail(houseId);
  if (!res.ok) {
    notFound();
  }

  const data = res.value;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/admin/houses" className="hover:text-heading">
              Pressings
            </Link>
            <span>/</span>
            <span className="text-heading font-semibold">{data.house.name}</span>
          </div>
          <h1 className="text-2xl font-black text-heading tracking-tight">
            {data.house.name}
          </h1>
        </div>
      </div>

      <HouseDetailTabs data={data} />
    </div>
  );
}
