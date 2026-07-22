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

// GET /api/dashboard/alerts/[id] — Fetch single alert details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getAuthClient(req);
    const userId = await getUserId(client);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await client.database
      .from("triggered_alerts")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("[Alerts API] GET [id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/dashboard/alerts/[id] — Update alert (status, snooze, resolve, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getAuthClient(req);
    const userId = await getUserId(client);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, ...updateFields } = body;

    let updateData: Record<string, any> = {};

    switch (action) {
      case "resolve":
        updateData = { status: "resolved", resolved_at: new Date().toISOString() };
        break;
      case "acknowledge":
        updateData = { status: "acknowledged" };
        break;
      case "snooze":
        const snoozeDuration = updateFields.snooze_minutes || 60;
        const snoozedUntil = new Date(Date.now() + snoozeDuration * 60 * 1000).toISOString();
        updateData = { status: "snoozed", snoozed_until: snoozedUntil };
        break;
      case "reactivate":
        updateData = { status: "active", snoozed_until: null };
        break;
      case "update_ai":
        updateData = {
          ai_summary: updateFields.ai_summary || undefined,
          ai_suggested_action: updateFields.ai_suggested_action || undefined,
          ai_draft_reply: updateFields.ai_draft_reply || undefined,
        };
        // Remove undefined keys
        Object.keys(updateData).forEach(
          (key) => updateData[key] === undefined && delete updateData[key]
        );
        break;
      case "update_rule":
        // Update alert rule fields
        updateData = { ...updateFields, updated_at: new Date().toISOString() };
        delete updateData.action;
        
        const { data: ruleData, error: ruleError } = await client.database
          .from("user_alerts")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .maybeSingle();

        if (ruleError) {
          return NextResponse.json({ error: ruleError.message }, { status: 500 });
        }
        return NextResponse.json({ data: ruleData });
      default:
        // Generic update
        updateData = updateFields;
    }

    const { data, error } = await client.database
      .from("triggered_alerts")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("[Alerts API] PATCH [id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/dashboard/alerts/[id] — Delete an alert or rule
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getAuthClient(req);
    const userId = await getUserId(client);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    if (type === "rule") {
      const { error } = await client.database
        .from("user_alerts")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await client.database
        .from("triggered_alerts")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Alerts API] DELETE [id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
