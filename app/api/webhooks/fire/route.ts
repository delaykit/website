import { dk } from "@/lib/delaykit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { webhookHandler } = await dk();
  if (!webhookHandler) {
    return new Response("PosthookScheduler not configured", { status: 404 });
  }
  return webhookHandler(request);
}
