import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { WhatsAppService } from "@/lib/whatsapp-service";
import { GoogleGenAI } from "@google/genai";

interface MockEmail {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
}

function getMockPlatformContext(platformId: string): string {
  switch (platformId) {
    case "slack":
      return `Slack Enterprise Notifications:
- [#engineering] Marcus: "Production deployment succeeded, checking rate limits next."
- [Direct Message] Alice Johnson: "@diyad can you check the new onboarding screens on Figma?"
- [#general] HR Bot: "Open enrollment for dental insurance closes Friday at 5 PM."`;
    
    case "github":
      return `GitHub Developer Activity:
- [PR #102] "Fix WebSocket reconnect loops in Realtime Sync client" - Merged by saloni.
- [Issue #45] "Database locks during migration script" - Assigned to you.
- [Commit] main - "Updated README and locked Tailwind CSS 3.4" - 2 hours ago.`;

    case "jira":
      return `Jira Project Board updates:
- [AURA-402] "Setup Stripe Webhooks for Billing Portal" - Status set to IN PROGRESS by you.
- [AURA-215] "Test edge functions under sandbox environment" - Status set to DONE.
- [AURA-110] "Review NDA and liability terms with counsel" - Due in 2 days.`;

    case "outlook":
      return `Outlook Corporate Mail & Calendar:
- [Email] john.miller@partner.org: "Feedback on the Q2 Budget proposal. Looks solid, but adjust marketing by 10%."
- [Meeting] "Q3 Roadmap Sync Review" with Saloni Connor - Tomorrow 10:00 AM.
- [Email] Admin Portal: "Your system password expires in 5 days. Please update."`;

    case "discord":
      return `Discord Community Notifications:
- [Developer Hub #announcements] Emily: "@everyone please make sure to pull latest template with Baileys fixes."
- [Development #general] dev_user: "Is the postgrest API rate limited in sandbox mode?"`;

    case "linkedin":
      return `LinkedIn Network Updates:
- [Message] Sarah Jenkins (Tech Ventures): "Enjoyed your latest post on agentic workflows! Let's connect next week."
- [Alert] 3 people viewed your profile in the last 24 hours.`;

    case "telegram":
      return `Telegram Personal Channels:
- [Aura Core Updates] "Stripe billing checkout gateway is now verified and active."
- [Chat] Bob: "Just finished merging the Next.js routing adjustments."`;

    case "notion":
      return `Notion Workspace Pages:
- [Document] "Product Specs - AI Agent Aura" modified by Saloni.
- [Database] "Weekly Tasks & Deliverables" - 2 new items added: "Verify SSL certificates" and "Clean up temp logs".`;

    default:
      return "";
  }
}

function getHighFidelityFallback(connectedApps: string[]): any {
  const priorityItems: any[] = [];

  if (connectedApps.includes("gmail")) {
    priorityItems.push({
      id: "fallback-gp1",
      source: "gmail",
      title: "Contract Review",
      time: "10:42 AM",
      description: "Review compliance section in Q3 draft contract.",
      priority: "high"
    });
  }

  if (connectedApps.includes("whatsapp")) {
    priorityItems.push({
      id: "fallback-wp1",
      source: "whatsapp",
      title: "Design specs alignment",
      time: "10:35 AM",
      description: "Discuss design onboarding specs and unblock team.",
      priority: "medium"
    });
  }

  if (connectedApps.includes("github") || connectedApps.length === 0) {
    priorityItems.push({
      id: "fallback-ghp1",
      source: "github",
      title: "Fix Deployment Lock",
      time: "2h ago",
      description: "Recover main branch migration deadlock.",
      priority: "high"
    });
  }

  if (priorityItems.length < 2) {
    priorityItems.push({
      id: "fallback-defp1",
      source: "gmail",
      title: "Billing Alert",
      time: "Yesterday",
      description: "Review GCP budget limit projection.",
      priority: "low"
    });
  }

  return {
    priorityItems,
    demoMode: true
  };
}

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

    const user = userData.user;

    // Check query params for refresh request
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    // Check Database Cache first
    if (!forceRefresh) {
      try {
        const { data: cacheRow } = await insforgeClient.database
          .from("dashboard_cache")
          .select("priority_content, priority_updated_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cacheRow?.priority_updated_at && cacheRow?.priority_content) {
          const cacheAgeMs = Date.now() - new Date(cacheRow.priority_updated_at).getTime();
          const TWO_HOURS = 2 * 60 * 60 * 1000;
          if (cacheAgeMs < TWO_HOURS) {
            console.log("[Dashboard Priority] Returning cached priorities from database.");
            return NextResponse.json({
              ...cacheRow.priority_content,
              cachedAt: cacheRow.priority_updated_at
            });
          }
        }
      } catch (cacheErr) {
        console.error("[Dashboard Priority] Cache lookup error:", cacheErr);
      }
    }

    const { data: integrations, error: dbError } = await insforgeClient.database
      .from("user_integrations")
      .select("platform_id, status, settings")
      .eq("user_id", user.id);

    if (dbError) {
      console.error("[Dashboard Priority] Database query error:", dbError);
      return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 });
    }

    const connectedIntegrations = integrations?.filter(item => item.status === "connected") || [];
    const connectedAppIds = connectedIntegrations.map(item => item.platform_id);

    let rawContext = "";

    // Gmail Data
    if (connectedAppIds.includes("gmail")) {
      try {
        const gmailUrl = new URL("/api/integrations/gmail/messages", req.url);
        const gmailRes = await fetch(gmailUrl.toString(), {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (gmailRes.ok) {
          const gmailData = await gmailRes.json();
          const messages: MockEmail[] = gmailData.messages || [];
          if (messages.length > 0) {
            rawContext += `\n--- Gmail Inbox (Recent Messages) ---\n`;
            messages.forEach((msg) => {
              rawContext += `From: ${msg.senderName} (${msg.senderEmail})\n`;
              rawContext += `Date: ${msg.date}\n`;
              rawContext += `Subject: ${msg.subject}\n`;
              rawContext += `Content: ${msg.body || msg.snippet}\n\n`;
            });
          }
        }
      } catch (gmailErr) {
        console.error("[Dashboard Priority] Gmail fetch error:", gmailErr);
      }
    }

    // WhatsApp Data
    if (connectedAppIds.includes("whatsapp")) {
      try {
        const waService = WhatsAppService.getInstance();
        const waChatsResponse = await waService.executeTool(user.id, "whatsapp_get_recent_messages", {}, token);
        const chats = waChatsResponse?.chats || [];
        if (chats.length > 0) {
          rawContext += `\n--- WhatsApp Chats ---\n`;
          chats.forEach((chat: any) => {
            rawContext += `Chat Name: ${chat.name} (${chat.id})\n`;
            rawContext += `Unread messages: ${chat.unreadCount || 0}\n`;
            rawContext += `Last Message Preview: ${chat.conversation || ""}\n\n`;
          });
        }
      } catch (waErr) {
        console.error("[Dashboard Priority] WhatsApp fetch error:", waErr);
      }
    }

    // Other platforms
    connectedAppIds.forEach(platformId => {
      if (platformId !== "gmail" && platformId !== "whatsapp") {
        const platformContext = getMockPlatformContext(platformId);
        if (platformContext) {
          rawContext += `\n--- Connected App: ${platformId} ---\n${platformContext}\n\n`;
        }
      }
    });

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log("[Dashboard Priority] GEMINI_API_KEY not found. Falling back to fallback response.");
      const fallback = getHighFidelityFallback(connectedAppIds);

      try {
        await saveToCache(insforgeClient, user.id, fallback);
      } catch (dbCacheErr) {
        console.error("[Dashboard Priority] Failed to save DB cache for fallback:", dbCacheErr);
      }

      return NextResponse.json(fallback);
    }

    try {
      console.log("[Dashboard Priority] Calling Gemini model gemini-3.1-flash-lite...");
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are Aura, an elite AI personal assistant. You analyze the user's communications, message logs, and updates across connected workspaces to identify critical tasks.
Based on the provided communications, extract the top 2 to 3 most critical action items requiring focus today.

You must output a strictly structured JSON response containing:
- priorityItems: An array of the top 2 to 3 most critical action items. Each item must have:
  - id: A unique string ID (e.g. "p1", "p2").
  - source: The platform name lowercase (must be one of: 'gmail', 'whatsapp', 'slack', 'outlook', 'discord', 'linkedin', 'telegram', 'notion', 'github', 'jira').
  - title: A very short, concise title or action item name (max 5 words).
  - time: Time description (e.g., "Due 10 AM", "Urgent", "Today").
  - description: A short, high-fidelity context sentence describing exactly what the user needs to do (max 8 words).
  - priority: Must be exactly "high", "medium", or "low".

If there are no active messages or connected apps in the input data, simulate a realistic scenario with mock alerts representing system health, generic updates, or reminders.

CRITICAL: Return only raw, valid JSON. Do not include markdown code block formatting. Output directly. Make task descriptions extremely brief and short.`;

      const contents = `Here is the current date and time: ${new Date().toISOString()}
Connected apps: ${connectedAppIds.join(", ") || "None"}

Raw connected platforms data logs:
${rawContext || "No messages. The user has no connected apps or there are no unread updates."}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      let cleanedJson = responseText.trim();
      if (cleanedJson.startsWith("```")) {
        cleanedJson = cleanedJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      const payload = JSON.parse(cleanedJson);
      const result = {
        ...payload,
        demoMode: false
      };

      // Save to database cache
      try {
        await saveToCache(insforgeClient, user.id, result);
      } catch (dbCacheErr) {
        console.error("[Dashboard Priority] Failed to save DB cache:", dbCacheErr);
      }

      return NextResponse.json(result);

    } catch (geminiErr: any) {
      console.error("[Dashboard Priority] Gemini generation failed, reverting to fallback:", geminiErr);
      const fallback = getHighFidelityFallback(connectedAppIds);

      try {
        await saveToCache(insforgeClient, user.id, fallback);
      } catch (dbCacheErr) {
        console.error("[Dashboard Priority] Failed to save DB cache for fallback:", dbCacheErr);
      }

      return NextResponse.json({
        ...fallback,
        error: geminiErr.message || "Gemini generation failed"
      });
    }

  } catch (error: any) {
    console.error("[Dashboard Priority API Route Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}

async function saveToCache(insforgeClient: any, userId: string, priorityContent: any) {
  const { data: existingCache } = await insforgeClient.database
    .from("dashboard_cache")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingCache) {
    await insforgeClient.database
      .from("dashboard_cache")
      .update({
        priority_content: priorityContent,
        priority_updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
  } else {
    await insforgeClient.database
      .from("dashboard_cache")
      .insert([{
        user_id: userId,
        priority_content: priorityContent,
        priority_updated_at: new Date().toISOString()
      }]);
  }
}
