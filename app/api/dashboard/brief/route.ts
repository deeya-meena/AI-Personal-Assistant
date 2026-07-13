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

function getHighFidelityFallback(userName: string, connectedApps: string[]): any {
  const importantCount = connectedApps.length > 0 ? connectedApps.length * 2 : 3;
  const priorityCount = connectedApps.length > 0 ? connectedApps.length + 1 : 2;
  const followUpsCount = connectedApps.length > 0 ? connectedApps.length : 1;

  const briefs: any[] = [];

  if (connectedApps.includes("gmail")) {
    briefs.push({
      id: "fallback-g1",
      source: "gmail",
      title: "Sarah Connor - Contract Review",
      sender: "Sarah Connor",
      summary: "Contract draft sent for digital signature.",
      time: "10:42 AM"
    });
  }

  if (connectedApps.includes("whatsapp")) {
    briefs.push({
      id: "fallback-w1",
      source: "whatsapp",
      title: "Alice Johnson - Design Alignment",
      sender: "Alice Johnson",
      summary: "Align on onboarding specs and rate limits.",
      time: "10:35 AM"
    });
  }

  if (connectedApps.includes("github") || connectedApps.length === 0) {
    briefs.push({
      id: "fallback-gh1",
      source: "github",
      title: "Deployment lock issue on main",
      sender: "GitHub Core",
      summary: "Production deployment failed at DB migration.",
      time: "2h ago"
    });
  }

  if (connectedApps.includes("slack")) {
    briefs.push({
      id: "fallback-s1",
      source: "slack",
      title: "Marcus - Stand-up Summary",
      sender: "Marcus (Slack)",
      summary: "Onboarding screens shipped; marketing ready to launch.",
      time: "11m ago"
    });
  }

  if (briefs.length < 2) {
    briefs.push({
      id: "fallback-def1",
      source: "gmail",
      title: "Aura System - Storage Alert",
      sender: "Aura Daemon",
      summary: "Sandbox DB storage exceeded 80% usage.",
      time: "Yesterday"
    });
  }

  return {
    welcomeMessage: `Welcome back, ${userName}! Aura has analyzed your communication feeds and compiled today's summary notes. You have a few items requiring action.`,
    stats: {
      importantCount,
      priorityCount,
      followUpsCount
    },
    briefs,
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
          .select("brief_content, brief_updated_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cacheRow?.brief_updated_at && cacheRow?.brief_content) {
          const cacheAgeMs = Date.now() - new Date(cacheRow.brief_updated_at).getTime();
          const TWO_HOURS = 2 * 60 * 60 * 1000;
          if (cacheAgeMs < TWO_HOURS) {
            console.log("[Dashboard Brief] Returning cached brief from database.");
            return NextResponse.json({
              ...cacheRow.brief_content,
              cachedAt: cacheRow.brief_updated_at
            });
          }
        }
      } catch (cacheErr) {
        console.error("[Dashboard Brief] Cache lookup error:", cacheErr);
      }
    }

    const { data: profile } = await insforgeClient.database
      .from("users")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    const fullName = profile?.name || user.email?.split("@")[0] || "Aura User";

    const { data: integrations, error: dbError } = await insforgeClient.database
      .from("user_integrations")
      .select("platform_id, status, settings")
      .eq("user_id", user.id);

    if (dbError) {
      console.error("[Dashboard Brief] Database query error:", dbError);
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
        console.error("[Dashboard Brief] Gmail fetch error:", gmailErr);
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
        console.error("[Dashboard Brief] WhatsApp fetch error:", waErr);
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
      console.log("[Dashboard Brief] GEMINI_API_KEY not found. Falling back to fallback response.");
      const fallback = getHighFidelityFallback(fullName, connectedAppIds);
      
      // Save fallback to database cache as well
      try {
        await saveToCache(insforgeClient, user.id, fallback);
      } catch (dbCacheErr) {
        console.error("[Dashboard Brief] Failed to save DB cache for fallback:", dbCacheErr);
      }

      return NextResponse.json(fallback);
    }

    try {
      console.log("[Dashboard Brief] Calling Gemini model gemini-3.1-flash-lite...");
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are Aura, an elite AI personal assistant. You analyze the user's communications, message logs, and updates across connected workspaces to generate a daily morning briefing.
Based on the provided communications, synthesize a personalized morning brief.

You must output a strictly structured JSON response containing:
- welcomeMessage: A custom welcome greeting mentioning the user's name "${fullName}" and summarizing the level of activity in their inbox in a friendly but executive tone (e.g. "Welcome back, John! You have 3 urgent action items to review today.").
- stats: An object containing:
  - importantCount: The total count of important/unread updates.
  - priorityCount: The count of items that are critical and require immediate attention today.
  - followUpsCount: The count of follow-ups or pending replies needed.
- briefs: An array of 2 to 3 items summarizing key events. Each item must have:
  - id: A unique string ID (e.g. "b1", "b2").
  - source: The platform name lowercase (must be one of: 'gmail', 'whatsapp', 'slack', 'outlook', 'discord', 'linkedin', 'telegram', 'notion', 'github', 'jira').
  - title: A very short title of the message thread or topic (max 5 words).
  - sender: The sender's name or channel name.
  - summary: A very short, single-sentence summary of the update (max 12 words).
  - time: A short time indicator (e.g., "10:30 AM", "2h ago", "Yesterday").

If there are no active messages or connected apps in the input data, simulate a realistic scenario with mock alerts representing system health, generic updates, or reminders, encouraging the user to connect more integrations.

CRITICAL: Return only raw, valid JSON. Do not include markdown code block formatting. Output directly. Make summaries extremely brief and quick to read.`;

      const contents = `Here is the current date and time: ${new Date().toISOString()}
User Name: ${fullName}
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
        console.error("[Dashboard Brief] Failed to save DB cache:", dbCacheErr);
      }

      return NextResponse.json(result);

    } catch (geminiErr: any) {
      console.error("[Dashboard Brief] Gemini generation failed, reverting to fallback:", geminiErr);
      const fallback = getHighFidelityFallback(fullName, connectedAppIds);
      
      try {
        await saveToCache(insforgeClient, user.id, fallback);
      } catch (dbCacheErr) {
        console.error("[Dashboard Brief] Failed to save DB cache for fallback:", dbCacheErr);
      }

      return NextResponse.json({
        ...fallback,
        error: geminiErr.message || "Gemini generation failed"
      });
    }

  } catch (error: any) {
    console.error("[Dashboard Brief API Route Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}

async function saveToCache(insforgeClient: any, userId: string, briefContent: any) {
  const { data: existingCache } = await insforgeClient.database
    .from("dashboard_cache")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingCache) {
    await insforgeClient.database
      .from("dashboard_cache")
      .update({
        brief_content: briefContent,
        brief_updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
  } else {
    await insforgeClient.database
      .from("dashboard_cache")
      .insert([{
        user_id: userId,
        brief_content: briefContent,
        brief_updated_at: new Date().toISOString()
      }]);
  }
}
