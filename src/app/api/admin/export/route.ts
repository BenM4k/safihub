import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/services/auth";
import { recordRateLimitHit } from "@/services/abuse/rate-limiter";
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

  const rl = await recordRateLimitHit(`admin-export:${auth.value.user.id}`, 10, 60);
  if (!rl.allowed) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(rl.resetSeconds) },
    });
  }

  const searchParams = request.nextUrl.searchParams;
  const dataset = (searchParams.get("dataset") ?? "orders") as ExportDataset;
  const format = (searchParams.get("format") ?? "csv") as ExportFormat;
  const rawLimit = searchParams.get("limit");
  const parsedLimit = rawLimit ? Number(rawLimit) : undefined;
  const limit =
    parsedLimit !== undefined && Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(10000, Math.trunc(parsedLimit)))
      : undefined;

  if (!["orders", "ledger", "customers"].includes(dataset)) {
    return new NextResponse("Invalid dataset", { status: 400 });
  }

  if (!["csv", "json"].includes(format)) {
    return new NextResponse("Invalid format", { status: 400 });
  }

  const result = await exportAdminDataset(dataset, format, { limit });
  if (!result.ok) {
    return new NextResponse("Export failed", { status: 500 });
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
