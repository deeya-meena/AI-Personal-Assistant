import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { GoogleGenAI } from "@google/genai";

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

// POST /api/dashboard/alerts/ai — AI-powered alert actions
export async function POST(req: NextRequest) {
  try {
    const client = getAuthClient(req);
    const userId = await getUserId(client);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const body = await req.json();
    const { action, alertId, alertData } = body;

    const ai = new GoogleGenAI({ apiKey });

    switch (action) {
      case "summarize": {
        const alert = alertData || (await fetchAlert(client, alertId, userId));
        if (!alert) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `Summarize this alert concisely in 2-3 sentences. Focus on the key issue, who it's from, and what action is needed.

Alert Title: ${alert.title}
Description: ${alert.description}
Source App: ${alert.source_app}
Priority: ${alert.priority}
Full Content: ${JSON.stringify(alert.full_content)}`,
          config: {
            systemInstruction: "You are Aura, an AI personal assistant. Provide clear, actionable summaries. Be concise and direct.",
          },
        });

        const summary = response?.text || "Unable to generate summary.";

        // Save to DB
        if (alertId) {
          await client.database
            .from("triggered_alerts")
            .update({ ai_summary: summary })
            .eq("id", alertId)
            .eq("user_id", userId);
        }

        return NextResponse.json({ result: summary });
      }

      case "suggest_action": {
        const alert = alertData || (await fetchAlert(client, alertId, userId));
        if (!alert) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `Based on this alert, suggest the single most appropriate next action the user should take. Be specific and actionable.

Alert Title: ${alert.title}
Description: ${alert.description}
Source App: ${alert.source_app}
Priority: ${alert.priority}
Status: ${alert.status}
Full Content: ${JSON.stringify(alert.full_content)}`,
          config: {
            systemInstruction: "You are Aura, an AI personal assistant. Suggest one clear, actionable next step. Keep it under 2 sentences.",
          },
        });

        const suggestion = response?.text || "Review and acknowledge this alert.";

        if (alertId) {
          await client.database
            .from("triggered_alerts")
            .update({ ai_suggested_action: suggestion })
            .eq("id", alertId)
            .eq("user_id", userId);
        }

        return NextResponse.json({ result: suggestion });
      }

      case "draft_reply": {
        const alert = alertData || (await fetchAlert(client, alertId, userId));
        if (!alert) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

        // Load user profile for personalization
        const { data: profile } = await client.database
          .from("users")
          .select("name, email")
          .eq("id", userId)
          .maybeSingle();

        const userName = profile?.name || "User";

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `Draft a professional reply for this alert/message. The reply should be from "${userName}".

Alert Title: ${alert.title}
Description: ${alert.description}
Source App: ${alert.source_app}
Full Content: ${JSON.stringify(alert.full_content)}

Context: This is a ${alert.source_app} ${alert.source_app === "gmail" ? "email" : "message"}. Draft an appropriate response that addresses the key points.`,
          config: {
            systemInstruction: `You are Aura, an AI assistant drafting replies on behalf of ${userName}. Write a professional, friendly reply. Don't include subject line or email headers — just the body text. Keep it concise but helpful.`,
          },
        });

        const draft = response?.text || "Thank you for bringing this to my attention. I'll look into it and get back to you shortly.";

        if (alertId) {
          await client.database
            .from("triggered_alerts")
            .update({ ai_draft_reply: draft })
            .eq("id", alertId)
            .eq("user_id", userId);
        }

        return NextResponse.json({ result: draft });
      }

      case "suggest_alerts": {
        // Get user's connected integrations
        const { data: integrations } = await client.database
          .from("user_integrations")
          .select("platform_id, status")
          .eq("user_id", userId);

        const connectedApps = integrations
          ?.filter((i: any) => i.status === "connected")
          .map((i: any) => i.platform_id) || [];

        // Get existing alert rules to avoid duplicates
        const { data: existingRules } = await client.database
          .from("user_alerts")
          .select("name, trigger_condition, selected_apps")
          .eq("user_id", userId);

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `Based on the user's connected apps and existing alert rules, suggest 4-6 useful alert configurations they should set up.

Connected Apps: ${connectedApps.length > 0 ? connectedApps.join(", ") : "gmail, whatsapp, slack, github"}
Existing Alert Rules: ${JSON.stringify(existingRules || [])}

For each suggestion, provide:
- name: Short alert name
- description: Why this alert is useful (1 sentence)
- apps: Which apps to monitor
- condition: The trigger condition type
- priority: suggested priority level
- icon: An emoji representing the alert

Return as a JSON array.`,
          config: {
            systemInstruction: "You are Aura, an AI personal assistant. Suggest practical, useful alerts. Focus on productivity, security, and communication. Return valid JSON array only.",
            responseMimeType: "application/json",
          },
        });

        let suggestions = [];
        try {
          const text = response?.text || "[]";
          const parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/, "").trim());
          const rawList = Array.isArray(parsed) ? parsed : parsed.suggestions || [];
          suggestions = rawList.map((item: any) => ({
            name: String(item.name || "Custom Alert"),
            description: String(item.description || ""),
            apps: Array.isArray(item.apps)
              ? item.apps.map(String)
              : typeof item.apps === "string"
              ? item.apps.split(",").map((a: string) => a.trim()).filter(Boolean)
              : ["system"],
            condition: String(item.condition || "keyword_match"),
            priority: String(item.priority || "medium"),
            icon: String(item.icon || "🔔"),
          }));
        } catch {
          suggestions = [
            {
              name: "VIP Email Alerts",
              description: "Get notified when you receive emails from important contacts",
              apps: ["gmail"],
              condition: "priority_sender",
              priority: "high",
              icon: "⭐",
            },
            {
              name: "Unread Message Threshold",
              description: "Alert when unread messages exceed a threshold",
              apps: ["whatsapp", "slack"],
              condition: "unread_threshold",
              priority: "medium",
              icon: "📬",
            },
            {
              name: "Mention Monitor",
              description: "Track when someone mentions your name across apps",
              apps: ["slack", "discord", "github"],
              condition: "mention",
              priority: "high",
              icon: "📢",
            },
            {
              name: "Deadline Approaching",
              description: "Alert for tasks and issues nearing their due date",
              apps: ["jira", "github"],
              condition: "deadline_approaching",
              priority: "critical",
              icon: "⏰",
            },
          ];
        }

        return NextResponse.json({ suggestions });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[Alerts AI API] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function fetchAlert(
  client: ReturnType<typeof createClient>,
  alertId: string,
  userId: string
) {
  if (!alertId) return null;
  const { data } = await client.database
    .from("triggered_alerts")
    .select("*")
    .eq("id", alertId)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}
