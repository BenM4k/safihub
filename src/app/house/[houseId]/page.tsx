import { redirect } from "next/navigation";

export default async function HouseIdRedirectPage({
  params,
}: {
  params: Promise<{ houseId: string }>;
}) {
  await params;
  redirect("/house");
}
