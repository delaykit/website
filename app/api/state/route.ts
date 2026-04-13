import { NextResponse } from "next/server";
import { getState } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getState();
  return NextResponse.json(state, {
    headers: {
      // Cap origin load to ~1 req/sec regardless of concurrent pollers.
      // The client's post-click cooldown covers the 1s staleness window,
      // so no one who just clicked sees a pre-click cached snapshot.
      "Cache-Control": "public, s-maxage=1",
      "CDN-Cache-Control": "public, s-maxage=1",
      "Vercel-CDN-Cache-Control": "public, s-maxage=1",
    },
  });
}
