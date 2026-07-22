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

// GET /api/dashboard/alerts — List triggered alerts with filters & pagination
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
    const includeArchived = url.searchParams.get("include_archived") === "true";

    // Pagination
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "15")));
    const offset = (page - 1) * limit;

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

    // Fetch triggered alerts
    let query = client.database
      .from("triggered_alerts")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    // Filter out archived unless explicitly included
    if (!includeArchived) {
      query = query.is("archived_at", null);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (priority && priority !== "all") {
      query = query.eq("priority", priority);
    }
    if (sourceApp && sourceApp !== "all") {
      query = query.eq("source_app", sourceApp);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let alerts = data || [];

    // Client-side search filter (applied after fetch, counts might shift slightly, but keeps code simple)
    if (search) {
      const q = search.toLowerCase();
      alerts = alerts.filter(
        (a: any) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.source_app?.toLowerCase().includes(q)
      );
    }

    // Compute stats based on non-archived alerts
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const { data: allAlerts } = await client.database
      .from("triggered_alerts")
      .select("id, status, priority, created_at")
      .eq("user_id", userId)
      .is("archived_at", null);

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

    return NextResponse.json({
      data: alerts,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    });
  } catch (err: any) {
    console.error("[Alerts API] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/dashboard/alerts — Create a new alert rule or test it
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
      isTest, // Boolean flag for direct test trigger
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Alert name is required" }, { status: 400 });
    }

    // If it is a test alert request, trigger a mock alert instantly without saving the rule
    if (isTest) {
      console.log(`[Alerts API] Running Test Alert for apps: ${selected_apps}`);
      const mockAppName = (selected_apps && selected_apps.length > 0) ? selected_apps[0] : "system";
      
      const testAlert = {
        user_id: userId,
        source_app: mockAppName,
        title: `[TEST] ${name}`,
        description: description || `This is a test notification for the rule: ${name}`,
        full_content: {
          testMode: true,
          trigger_condition,
          trigger_config,
          notification_method,
          frequency,
          tested_at: new Date().toISOString()
        },
        priority: priority || "medium",
        status: "active",
        ai_data: {
          summary: `This is an automated test alert for your rule "${name}".`,
          action: "Review this alert to verify your configuration.",
        }
      };

      const { data: testData, error: testErr } = await client.database
        .from("triggered_alerts")
        .insert([testAlert])
        .select()
        .maybeSingle();

      if (testErr) {
        return NextResponse.json({ error: testErr.message }, { status: 500 });
      }

      return NextResponse.json({ data: testData, isTest: true }, { status: 201 });
    }

    // Normal save rule logic
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

    // Trigger Trigger.dev task to run the alert checks
    try {
      const { tasks } = await import("@trigger.dev/sdk/v3");
      await tasks.trigger("process-alert-rule", {
        ruleId: data.id,
        userId: userId,
      });
    } catch (triggerErr: any) {
      console.error("[Alerts API] Trigger.dev invocation failed, running fallback direct evaluation:", triggerErr);
      try {
        const { evaluateAlertRule } = await import("@/src/trigger/alerts");
        await evaluateAlertRule(data.id, userId);
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

// PATCH /api/dashboard/alerts — Bulk actions for scale
export async function PATCH(req: NextRequest) {
  try {
    const client = getAuthClient(req);
    const userId = await getUserId(client);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No alert IDs provided" }, { status: 400 });
    }

    let updateFields: Record<string, any> = {};
    if (action === "bulk_resolve") {
      updateFields = { status: "resolved", resolved_at: new Date().toISOString() };
    } else if (action === "bulk_archive") {
      updateFields = { archived_at: new Date().toISOString() };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data, error } = await client.database
      .from("triggered_alerts")
      .update(updateFields)
      .eq("user_id", userId)
      .in("id", ids)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, success: true });
  } catch (err: any) {
    console.error("[Alerts API] PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

