import { NextResponse } from "next/server";
import { ledgerCsv } from "@/clinical/admin/ops";
import { SERVICE } from "@/clinical/config/service";
import { PRIVATE_HEADERS } from "@/clinical/http";
import { staffGate } from "@/clinical/staff";

export const dynamic = "force-dynamic";

/** Monthly pay export for admins (with 2FA): reviews per doctor. */
export async function GET(request: Request) {
  const gate = await staffGate("admin");
  if (gate.state !== "ok") return new NextResponse(null, { status: 404, headers: PRIVATE_HEADERS });
  const month = new URL(request.url).searchParams.get("luna") ?? "";
  try {
    const csv = await ledgerCsv(gate.session, month, SERVICE.doctorFeeRon);
    return new NextResponse(csv, {
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="evaluari-medici-${month}.csv"`,
      },
    });
  } catch {
    return new NextResponse(null, { status: 400, headers: PRIVATE_HEADERS });
  }
}
