import { NextResponse } from "next/server";
import { dk, FIRE_WAIT } from "@/lib/delaykit";
import { incrementClicks, getState } from "@/lib/store";

export const runtime = "nodejs";

export async function POST() {
  const { instance } = await dk();

  const { settlesAt } = await instance.debounce("fire", {
    key: "global",
    wait: FIRE_WAIT,
  });
  await incrementClicks(settlesAt);

  const state = await getState();
  return NextResponse.json(state);
}
