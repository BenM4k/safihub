import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/services/auth";
import {
  exportAdminDataset,
  type ExportDataset,
  type ExportFormat,
} from "@/services/admin";

export async function GET(request: NextRequest) {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const dataset = (searchParams.get("dataset") ?? "orders") as ExportDataset;
  const format = (searchParams.get("format") ?? "csv") as ExportFormat;

  if (!["orders", "ledger", "customers"].includes(dataset)) {
    return new NextResponse("Invalid dataset", { status: 400 });
  }

  if (!["csv", "json"].includes(format)) {
    return new NextResponse("Invalid format", { status: 400 });
  }

  const result = await exportAdminDataset(dataset, format);
  if (!result.ok) {
    return new NextResponse(result.error, { status: 500 });
  }

  return new NextResponse(result.value.content, {
    status: 200,
    headers: {
      "Content-Type": result.value.mimeType,
      "Content-Disposition": `attachment; filename="${result.value.filename}"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
