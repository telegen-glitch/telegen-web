import { NextResponse } from "next/server";
import { clinicalEnv } from "@/clinical/env";
import { PRIVATE_HEADERS } from "@/clinical/http";
import { tick } from "@/clinical/jobs/tick";

export const dynamic = "force-dynamic";

/**
 * Scheduled job endpoint. Vercel Cron and the GitHub Actions schedule call it
 * with `Authorization: Bearer <CRON_SECRET>`; anything else gets 404.
 */
export async function GET(request: Request) {
  const secret = clinicalEnv().cronSecret;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return new NextResponse(null, { status: 404, headers: PRIVATE_HEADERS });
  return NextResponse.json(await tick(), { headers: PRIVATE_HEADERS });
}
