import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Missing auth token" }, { status: 401 });
    }

    const insforgeClient = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
      accessToken: token
    });

    const { data: userData, error: authError } = await insforgeClient.auth.getCurrentUser();
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
    }

    const body = await req.json();
    const { platformId, to, subject, message, threadId, recipientJid, chatId, phoneNumber } = body;

    if (!platformId || !to || !message) {
      return NextResponse.json({ error: "Missing required fields: platformId, to, message" }, { status: 400 });
    }

    if (platformId === "whatsapp") {
      const isDebug = process.env.DEBUG_WHATSAPP === 'true';
      const requestId = Math.random().toString(36).substring(2, 7);
      if (isDebug) {
        console.log(`[WA DEBUG][${requestId}][${new Date().toISOString()}] POST /api/integrations/send-reply request body:`, JSON.stringify(body));
      }
    }

    console.log(`[Unified Send Reply] Platform: ${platformId}, To: ${to}, Thread: ${threadId || "none"}`);

    if (platformId === "gmail") {
      // Dispatch via Gmail send API
      const sendUrl = new URL("/api/integrations/gmail/send", req.url);
      const sendRes = await fetch(sendUrl.toString(), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ to, subject: subject || "Re: Aura Follow-up", body: message, threadId })
      });

      const data = await sendRes.json();
      if (!sendRes.ok) {
        return NextResponse.json({ error: data.error || "Gmail dispatch failed" }, { status: sendRes.status });
      }

      return NextResponse.json(data);
    }

    if (platformId === "whatsapp") {
      const finalRecipient = recipientJid || chatId || phoneNumber || to;
      console.log(`[Unified Send Reply] WhatsApp targeting detail:`, {
        recipientJid,
        chatId,
        phoneNumber,
        to,
        resolvedTarget: finalRecipient
      });

      // Dispatch via WhatsApp Execute API
      const waUrl = new URL("/api/integrations/whatsapp/execute", req.url);
      const waRes = await fetch(waUrl.toString(), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          toolName: "whatsapp_send_message",
          params: { chatId: finalRecipient, message }
        })
      });

      const data = await waRes.json();
      if (!waRes.ok || (data && data.success === false)) {
        return NextResponse.json({ error: data.error || "WhatsApp dispatch failed" }, { status: waRes.status === 200 ? 400 : waRes.status });
      }

      return NextResponse.json(data);
    }

    // Sandbox fallbacks for other mock platforms
    console.log(`[Sandbox Send Reply] Mocking send for platform: ${platformId} to: ${to}`);
    return NextResponse.json({
      success: true,
      messageId: `mock_${platformId}_msg_${Math.random().toString(36).substring(7)}`,
      mode: "sandbox",
      message: `Simulated response sent successfully on ${platformId} to ${to}.`
    });

  } catch (error: any) {
    console.error("[Unified Send Reply Exception]:", error);
    return NextResponse.json({ error: error.message || "Failed to dispatch reply" }, { status: 500 });
  }
}
