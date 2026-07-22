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

    const { data: schedules, error: dbError } = await insforgeClient.database
      .from("custom_briefing_schedules")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("[Schedules GET] Database error:", dbError);
      return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
    }

    return NextResponse.json(schedules || []);

  } catch (error: any) {
    console.error("[Schedules GET Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}

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
    const { name, description, selected_apps, selected_categories, scheduled_time, frequency, priority_level, next_run_at } = body;

    if (!name || !scheduled_time) {
      return NextResponse.json({ error: "Name and scheduled time are required" }, { status: 400 });
    }

    let calculatedNextRun = next_run_at;
    if (!calculatedNextRun) {
      const [hours, minutes] = scheduled_time.split(":").map(Number);
      const now = new Date();
      const targetDate = new Date();
      targetDate.setHours(hours, minutes, 0, 0);

      if (targetDate.getTime() <= now.getTime()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      calculatedNextRun = targetDate.toISOString();
    }

    const newSchedule = {
      user_id: userData.user.id,
      name,
      description: description || "",
      selected_apps: selected_apps || [],
      selected_categories: selected_categories || [],
      scheduled_time,
      frequency: frequency || "daily",
      priority_level: priority_level || "medium",
      next_run_at: calculatedNextRun,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: inserted, error: dbError } = await insforgeClient.database
      .from("custom_briefing_schedules")
      .insert([newSchedule])
      .select()
      .single();

    if (dbError) {
      console.error("[Schedules POST] Database error:", dbError);
      return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
    }

    return NextResponse.json(inserted);

  } catch (error: any) {
    console.error("[Schedules POST Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    if (!id) {
      return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 });
    }

    const { error: dbError } = await insforgeClient.database
      .from("custom_briefing_schedules")
      .delete()
      .eq("id", id)
      .eq("user_id", userData.user.id);

    if (dbError) {
      console.error("[Schedules DELETE] Database error:", dbError);
      return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[Schedules DELETE Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
