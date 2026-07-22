import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";

function getAuthClient(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || "";
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
    accessToken: token,
  });
}

async function getUserId(client: ReturnType<typeof createClient>): Promise<string | null> {
  const { data, error } = await client.auth.getCurrentUser();
  if (error || !data?.user) return null;
  return data.user.id;
}

// GET /api/dashboard/alerts — List triggered alerts with filters
export async function GET(req: NextRequest) {
  try {
    const client = getAuthClient(req);
    const userId = await getUserId(client);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const sourceApp = url.searchParams.get("source_app");
    const search = url.searchParams.get("search");
    const type = url.searchParams.get("type");

    if (type === "rules") {
      const { data, error } = await client.database
        .from("user_alerts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ data: data || [] });
    }

    // Build filter object for triggered alerts
    const filters: Record<string, string> = { user_id: userId };
    if (status && status !== "all") filters.status = status;
    if (priority && priority !== "all") filters.priority = priority;
    if (sourceApp && sourceApp !== "all") filters.source_app = sourceApp;

    // Fetch triggered alerts
    let query = client.database
      .from("triggered_alerts")
      .select("*")
      .eq("user_id", userId);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (priority && priority !== "all") {
      query = query.eq("priority", priority);
    }
    if (sourceApp && sourceApp !== "all") {
      query = query.eq("source_app", sourceApp);
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let alerts = data || [];

    // Client-side search filter
    if (search) {
      const q = search.toLowerCase();
      alerts = alerts.filter(
        (a: any) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.source_app?.toLowerCase().includes(q)
      );
    }

    // Compute stats
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const { data: allAlerts } = await client.database
      .from("triggered_alerts")
      .select("id, status, priority, created_at")
      .eq("user_id", userId);

    const all = allAlerts || [];
    const stats = {
      active: all.filter((a: any) => a.status === "active").length,
      triggeredToday: all.filter((a: any) => a.created_at >= todayStart).length,
      highPriority: all.filter(
        (a: any) =>
          (a.priority === "critical" || a.priority === "high") &&
          a.status === "active"
      ).length,
      resolved: all.filter((a: any) => a.status === "resolved").length,
    };

    return NextResponse.json({ data: alerts, stats });
  } catch (err: any) {
    console.error("[Alerts API] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/dashboard/alerts — Create a new alert rule
export async function POST(req: NextRequest) {
  try {
    const client = getAuthClient(req);
    const userId = await getUserId(client);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      selected_apps,
      trigger_condition,
      trigger_config,
      priority,
      notification_method,
      frequency,
      action_type,
      action_config,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Alert name is required" }, { status: 400 });
    }

    const { data, error } = await client.database
      .from("user_alerts")
      .insert([
        {
          user_id: userId,
          name,
          description: description || null,
          selected_apps: selected_apps || [],
          trigger_condition: trigger_condition || "keyword_match",
          trigger_config: trigger_config || {},
          priority: priority || "medium",
          notification_method: notification_method || "in_app",
          frequency: frequency || "realtime",
          action_type: action_type || "notify",
          action_config: action_config || {},
          is_active: true,
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trigger Trigger.dev task to run the alert checks and schedule it
    try {
      const { tasks } = await import("@trigger.dev/sdk/v3");
      await tasks.trigger("process-alert-rule", {
        ruleId: data.id,
        userId: userId,
      });
      console.log(`[Alerts API] Successfully triggered Trigger.dev task 'process-alert-rule' for rule ${data.id}`);
    } catch (triggerErr: any) {
      console.error("[Alerts API] Trigger.dev invocation failed, running fallback direct evaluation:", triggerErr);
      try {
        const { evaluateAlertRule } = await import("@/src/trigger/alerts");
        await evaluateAlertRule(data.id, userId);
        console.log(`[Alerts API] Completed fallback direct evaluation for rule ${data.id}`);
      } catch (evalErr) {
        console.error("[Alerts API] Direct fallback evaluation failed:", evalErr);
      }
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    console.error("[Alerts API] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
