import { NextResponse } from "next/server";
import { currentSession } from "@/clinical/auth";
import { PRIVATE_HEADERS } from "@/clinical/http";
import { exportData } from "@/clinical/patient/data-rights";

export const dynamic = "force-dynamic";

/** The patient's own data as a JSON file (GDPR access and portability). */
export async function GET() {
  const session = await currentSession();
  if (!session) return new NextResponse(null, { status: 401, headers: PRIVATE_HEADERS });
  const data = await exportData(session);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      ...PRIVATE_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="datele-mele-telegen.json"',
    },
  });
}
