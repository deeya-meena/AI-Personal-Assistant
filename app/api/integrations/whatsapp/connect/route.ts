import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { WhatsAppService } from "@/lib/whatsapp-service";

export async function POST(req: NextRequest) {
  try {
    const { mode, phoneNumber } = await req.json();

    // Authenticate user from the Authorization header
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

    // Call service connect
    const result = await service.connect(user.id, token, { mode, phoneNumber });
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("[WhatsApp Connect API Route Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
