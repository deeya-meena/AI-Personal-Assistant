import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { WhatsAppService } from "@/lib/whatsapp-service";

export async function POST(req: NextRequest) {
  try {
    const { toolName, params } = await req.json();

    if (!toolName) {
      return NextResponse.json({ error: "Tool name is required" }, { status: 400 });
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

    const output = await service.executeTool(user.id, toolName, params || {}, token);
    return NextResponse.json(output);

  } catch (error: any) {
    console.error("[WhatsApp Execute API Route Exception]:", error);
    return NextResponse.json({ error: error.message || "Failed to execute tool" }, { status: 500 });
  }
}
