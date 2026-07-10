import { NextRequest } from "next/server";
import { WhatsAppService } from "@/lib/whatsapp-service";
import { createClient } from "@insforge/sdk";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Extract token from query string or headers
  const token = req.nextUrl.searchParams.get("token") || "";
  
  if (!token) {
    return new Response("Unauthorized: Missing access token", { status: 401 });
  }

  const insforgeClient = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
    accessToken: token
  });

  const { data: userData, error: authError } = await insforgeClient.auth.getCurrentUser();
  if (authError || !userData?.user) {
    return new Response("Unauthorized: Invalid session", { status: 401 });
  }

  const userId = userData.user.id;
  const service = WhatsAppService.getInstance();

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = (event: string, data: any) => {
    try {
      writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
    } catch (e) {
      console.error("[WhatsApp SSE] write error:", e);
    }
  };

  const onUpdate = (data: any) => {
    sendEvent("status", data);
  };
  
  const onPairingCode = (data: any) => {
    sendEvent("pairingCode", data);
  };

  service.on(`connection:${userId}`, onUpdate);
  service.on(`pairing:${userId}`, onPairingCode);

  const heartbeat = setInterval(() => {
    try {
      writer.write(encoder.encode(": keepalive\n\n"));
    } catch (e) {}
  }, 15000);

  // Initial event sending current status
  service.getStatus(userId, token).then((currentStatus) => {
    sendEvent("status", {
      status: currentStatus.status,
      phone: currentStatus.phone,
      mode: currentStatus.mode,
      lastConnected: currentStatus.lastConnected
    });
  }).catch(() => {});

  req.signal.addEventListener("abort", () => {
    service.off(`connection:${userId}`, onUpdate);
    service.off(`pairing:${userId}`, onPairingCode);
    clearInterval(heartbeat);
    try {
      writer.close();
    } catch (e) {}
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    }
  });
}
