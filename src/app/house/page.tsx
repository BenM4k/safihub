import { redirect } from "next/navigation";

// instant = false: kept on purpose — redirect alias for authenticated partner portal
export const instant = false;

export default function HouseRedirectPage() {
  redirect("/partner");
}
