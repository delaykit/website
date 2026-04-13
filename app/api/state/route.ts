import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { getState } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  // Reading headers() marks the route as dynamic without adding no-store
  const headerList = await headers();
  const ifNoneMatch = headerList.get("if-none-match");

  const state = await getState();
  const body = JSON.stringify(state);

  // Short content fingerprint as the ETag
  const etag = `"${createHash("sha1").update(body).digest("hex").slice(0, 16)}"`;

  const cacheHeaders = {
    // Vercel Edge cache: serve fresh for 1s, stale for up to 59s while
    // revalidating in the background. Cheap polling at viral scale.
    "Cache-Control": "public, s-maxage=1, stale-while-revalidate=59",
    "CDN-Cache-Control": "public, s-maxage=1, stale-while-revalidate=59",
    "Vercel-CDN-Cache-Control": "public, s-maxage=1, stale-while-revalidate=59",
    ETag: etag,
  };

  if (ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304, headers: cacheHeaders });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      ...cacheHeaders,
      "Content-Type": "application/json",
    },
  });
}
