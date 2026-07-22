import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const customOnly = searchParams.get("custom") === "true";

    // 1. Fetch a single run by ID
    if (id) {
      const { data: run, error: dbError } = await insforgeClient.database
        .from("generated_briefings")
        .select("*, custom_briefing_schedules(name, description)")
        .eq("id", id)
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (dbError) {
        console.error("[Runs GET Single] Database error:", dbError);
        return NextResponse.json({ error: "Failed to fetch briefing run" }, { status: 500 });
      }

      if (!run) {
        return NextResponse.json({ error: "Briefing run not found" }, { status: 404 });
      }

      return NextResponse.json(run);
    }

    // 2. Fetch all runs for the user
    let query = insforgeClient.database
      .from("generated_briefings")
      .select("*, custom_briefing_schedules(name, description)")
      .eq("user_id", userData.user.id);

    if (customOnly) {
      query = query.not("schedule_id", "is", null);
    }

    const { data: runs, error: dbError } = await query.order("created_at", { ascending: false });

    if (dbError) {
      console.error("[Runs GET List] Database error:", dbError);
      return NextResponse.json({ error: "Failed to fetch briefing runs" }, { status: 500 });
    }

    return NextResponse.json(runs || []);

  } catch (error: any) {
    console.error("[Runs GET Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
