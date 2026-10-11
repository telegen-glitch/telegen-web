import { NextResponse } from "next/server";
import { currentSession } from "@/clinical/auth";
import { PRIVATE_HEADERS } from "@/clinical/http";
import { openPhoto } from "@/clinical/intake/photos";

export const dynamic = "force-dynamic";

/** One photo, for its owner or the doctor on the case: a 60-second signed URL, or the bytes locally. */
export async function GET(_request: Request, ctx: RouteContext<"/api/clinical/photos/[id]">) {
  const { id } = await ctx.params;
  const session = await currentSession();
  if (!session) return new NextResponse(null, { status: 401, headers: PRIVATE_HEADERS });
  const photo = await openPhoto(session, id);
  if (!photo) return new NextResponse(null, { status: 404, headers: PRIVATE_HEADERS });
  if ("url" in photo) return NextResponse.redirect(photo.url, { status: 302, headers: PRIVATE_HEADERS });
  return new NextResponse(Buffer.from(photo.bytes), {
    headers: { ...PRIVATE_HEADERS, "Content-Type": "image/jpeg", "Content-Disposition": "inline" },
  });
}
