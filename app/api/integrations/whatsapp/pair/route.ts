import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { WhatsAppService } from "@/lib/whatsapp-service";

// Allow up to 60 seconds — Baileys needs time to open WS + handshake before returning the code
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || !phoneNumber.startsWith("+")) {
      return NextResponse.json({ error: "Validation Error: Phone number must start with '+' and contain country code." }, { status: 400 });
    }

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

    const user = userData.user;
    const service = WhatsAppService.getInstance();

    const pairingCode = await service.requestPairingCode(user.id, phoneNumber, token);
    return NextResponse.json({ success: true, pairingCode });

  } catch (error: any) {
    console.error("[WhatsApp Pair API Route Exception]:", error);
    return NextResponse.json({ error: error.message || "Failed to generate pairing code" }, { status: 500 });
  }
}
