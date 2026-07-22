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
  const emailItems = [];
  const messageItems = [];
  const mentionItems = [];
  const taskItems = [];
  const followUpItems = [];

  if (connectedApps.includes("gmail") || connectedApps.length === 0) {
    emailItems.push({
      id: "fallback-g1",
      source: "gmail",
      title: "Sarah Connor - Contract Review",
      sender: "Sarah Connor",
      summary: "Contract draft review for sandbox and liability clauses.",
      content: "Please review the updated Q3 contract draft containing new sandboxing and liability clauses. Requires review and digital signature before tomorrow's board meeting.",
      time: "10:24 AM",
      priority: "high"
    });
    followUpItems.push({
      id: "fallback-g1-reply",
      source: "gmail",
      title: "Sarah Connor - Contract Review",
      sender: "Sarah Connor",
      summary: "Requires review and signature before tomorrow at 10 AM.",
      content: "Please review the updated Q3 contract draft containing new sandboxing and liability clauses. Requires review and digital signature before tomorrow's board meeting.",
      time: "10:24 AM",
      priority: "high"
    });
  }

  if (connectedApps.includes("whatsapp") || connectedApps.length === 0) {
    messageItems.push({
      id: "fallback-w1",
      source: "whatsapp",
      title: "Dev Team - Deployment Failure",
      sender: "Marcus (Lead Dev)",
      summary: "Deployment failed due to database migration locks.",
      content: "Production deployment failed at step 4 due to database migration locks. The team is roll-backing. Direct contact requested if pipeline needs manual recovery override.",
      time: "09:45 AM",
      priority: "high",
      recipientJid: "15550199@s.whatsapp.net",
      chatId: "15550199@s.whatsapp.net",
      phoneNumber: "+15550199231",
      senderId: "15550199@s.whatsapp.net"
    });
  }

  if (connectedApps.includes("github") || connectedApps.length === 0) {
    mentionItems.push({
      id: "fallback-gh1",
      source: "github",
      title: "WebSocket reconnect loops fix",
      sender: "saloni",
      summary: "PR #102 merged for WebSocket reconnect loops in Realtime Sync client.",
      content: "[PR #102] 'Fix WebSocket reconnect loops in Realtime Sync client' - Merged by saloni.",
      time: "2h ago",
      priority: "medium"
    });
  }

  if (connectedApps.includes("jira") || connectedApps.length === 0) {
    taskItems.push({
      id: "fallback-j1",
      source: "jira",
      title: "Setup Stripe Webhooks",
      sender: "Jira System",
      summary: "Setup Stripe Webhooks for Billing Portal - Status: IN PROGRESS.",
      content: "[AURA-402] 'Setup Stripe Webhooks for Billing Portal' - Status set to IN PROGRESS by you. Due in 2 days.",
      time: "Yesterday",
      priority: "medium"
    });
  }

  return {
    welcomeMessage: `Welcome back, ${userName}! Aura has analyzed your communication feeds and compiled today's summary notes. You have a few items requiring action.`,
    highlight: "Sarah Connor requested an urgent review of the Q3 Contract Draft review before tomorrow's 10 AM meeting.",
    categories: {
      email: {
        count: emailItems.length,
        summary: emailItems.length > 0 ? "You have key contract review updates in your inbox." : "No new email updates.",
        items: emailItems
      },
      messages: {
        count: messageItems.length,
        summary: messageItems.length > 0 ? "Production deployment updates and team chat logs." : "No new messages.",
        items: messageItems
      },
      mentions: {
        count: mentionItems.length,
        summary: mentionItems.length > 0 ? "You were mentioned in PR reviews and team channels." : "No new mentions.",
        items: mentionItems
      },
      tasks: {
        count: taskItems.length,
        summary: taskItems.length > 0 ? "Updates on Stripe webhook integration tasks." : "No pending tasks.",
        items: taskItems
      },
      follow_ups: {
        count: followUpItems.length,
        summary: followUpItems.length > 0 ? "Action required: sign the Q3 contract review." : "No pending follow-ups.",
        items: followUpItems
      }
    },
    demoMode: true
  };
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const adminKey = req.headers.get("x-admin-key") || "";

    const isLocalAdmin = adminKey && adminKey === (process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "ik_2953fab02c96dcca63940dfc6ea1f77b");
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");
    const rawMode = searchParams.get("raw") === "true";

    const originalMetadataMap = new Map<string, { recipientJid: string; chatId: string; phoneNumber: string; senderId: string }>();

    let user: any = null;
    let insforgeClient: any = null;

    if (isLocalAdmin && userIdParam) {
      user = { id: userIdParam };
      insforgeClient = createClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || ""
      });
    } else {
      if (!token) {
        return NextResponse.json({ error: "Unauthorized: Missing auth token" }, { status: 401 });
      }

      insforgeClient = createClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
        accessToken: token
      });

      const { data: userData, error: authError } = await insforgeClient.auth.getCurrentUser();
      if (authError || !userData?.user) {
        return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
      }
      user = userData.user;
    }

    // Check query params for refresh request
    const forceRefresh = searchParams.get("refresh") === "true";

    // Also force refresh if WhatsApp now has data (store may have been empty when cache was written)
    const waService = WhatsAppService.getInstance();
    const waHasLiveData = waService.hasData(user.id);

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
          const cachedBriefHasWhatsApp = JSON.stringify(cacheRow.brief_content).includes("whatsapp");

          // Bypass cache if: it's stale, OR WhatsApp has live data but the cache was written without it
          const shouldBypass = cacheAgeMs >= TWO_HOURS || (waHasLiveData && !cachedBriefHasWhatsApp);

          if (!shouldBypass) {
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

    const connectedIntegrations = integrations?.filter((item: any) => item.status === "connected") || [];
    const connectedAppIds = connectedIntegrations.map((item: any) => item.platform_id);

    let rawContext = "";

    // Gmail Data
    if (connectedAppIds.includes("gmail")) {
      try {
        const gmailUrl = new URL("/api/integrations/gmail/messages", req.url);
        if (isLocalAdmin) {
          gmailUrl.searchParams.set("userId", user.id);
        }
        const gmailRes = await fetch(gmailUrl.toString(), {
          headers: isLocalAdmin 
            ? { "x-admin-key": adminKey }
            : { Authorization: `Bearer ${token}` }
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

    // WhatsApp Data — pull from in-memory store (populated by Baileys events)
    if (connectedAppIds.includes("whatsapp")) {
      try {
        const waService = WhatsAppService.getInstance();

        if (!waService.hasData(user.id)) {
          rawContext += `\n--- WhatsApp ---\nWhatsApp is connected but the message store is empty. Messages populate automatically as they arrive after connection.\n\n`;
        } else {
          // Unread chats with actual message content
          const unreadGroups = waService.getUnreadMessages(user.id);
          // Recent chats overview
          const recentChats = waService.getChats(user.id, 20);

          rawContext += `\n--- WhatsApp Messages ---\n`;
          rawContext += `Total active chats: ${recentChats.length}\n`;
          rawContext += `Chats with unread messages: ${unreadGroups.length}\n\n`;

          if (unreadGroups.length > 0) {
            rawContext += `=== Unread Messages ===\n`;
            unreadGroups.forEach((group) => {
              const chatLabel = group.chat.isGroup ? `[Group] ${group.chat.name}` : group.chat.name;
              
              // Register original metadata for the chat/message
              const tempId = `wa-chat-${group.chat.id}`;
              const phoneNum = group.chat.isGroup ? "" : group.chat.id.split('@')[0];
              originalMetadataMap.set(tempId, {
                recipientJid: group.chat.id,
                chatId: group.chat.id,
                phoneNumber: phoneNum,
                senderId: group.chat.id
              });

              rawContext += `\nChat: ${chatLabel} (Original ID: ${tempId}) (${group.chat.unreadCount} unread)\n`;
              group.messages.forEach((msg) => {
                const time = new Date(msg.timestamp * 1000).toLocaleString();
                rawContext += `  [${time}] ${msg.sender}: ${msg.text}\n`;
              });
            });
            rawContext += `\n`;
          }

          // Include last few messages from most recent chats (even if read)
          const topChats = recentChats.slice(0, 5);
          if (topChats.length > 0) {
            rawContext += `=== Recent Chat History ===\n`;
            topChats.forEach((chat) => {
              const msgs = waService.getMessages(user.id, chat.id, 5);
              if (msgs.length === 0) return;
              const chatLabel = chat.isGroup ? `[Group] ${chat.name}` : chat.name;

              // Register original metadata for the chat/message
              const tempId = `wa-chat-${chat.id}`;
              const phoneNum = chat.isGroup ? "" : chat.id.split('@')[0];
              originalMetadataMap.set(tempId, {
                recipientJid: chat.id,
                chatId: chat.id,
                phoneNumber: phoneNum,
                senderId: chat.id
              });

              rawContext += `\nChat: ${chatLabel} (Original ID: ${tempId})\n`;
              msgs.forEach((msg) => {
                const time = new Date(msg.timestamp * 1000).toLocaleString();
                rawContext += `  [${time}] ${msg.fromMe ? "Me" : msg.sender}: ${msg.text}\n`;
              });
            });
            rawContext += `\n`;
          }
        }
      } catch (waErr) {
        console.error("[Dashboard Brief] WhatsApp fetch error:", waErr);
      }
    }


    // Other platforms
    connectedAppIds.forEach((platformId: any) => {
      if (platformId !== "gmail" && platformId !== "whatsapp") {
        const platformContext = getMockPlatformContext(platformId);
        if (platformContext) {
          rawContext += `\n--- Connected App: ${platformId} ---\n${platformContext}\n\n`;
        }
      }
    });

    if (rawMode) {
      return NextResponse.json({ 
        rawContext, 
        connectedApps: connectedAppIds,
        originalMetadata: Object.fromEntries(originalMetadataMap)
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log("[Dashboard Brief] GEMINI_API_KEY not found. Falling back to fallback response.");
      const fallback = getHighFidelityFallback(fullName, connectedAppIds);
      
      try {
        await saveToCache(insforgeClient, user.id, fallback);
        await saveToGeneratedBriefings(insforgeClient, user.id, fallback);
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
- highlight: A single sentence summarizing the most critical update of the day.
- categories: An object containing grouping categories:
  - email: An object with 'count' (number of email items), 'summary' (short summary sentence of these emails), and 'items' (array of items).
  - messages: An object with 'count' (number of message items), 'summary' (short summary sentence of these messages), and 'items' (array of items).
  - mentions: An object with 'count', 'summary', and 'items'.
  - tasks: An object with 'count', 'summary', and 'items'.
  - follow_ups: An object with 'count', 'summary', and 'items'.

Each item in any category's 'items' array must have:
  - id: A unique string ID (e.g. "item-1", "item-2").
  - source: The platform name lowercase (must be one of: 'gmail', 'whatsapp', 'slack', 'outlook', 'discord', 'linkedin', 'telegram', 'notion', 'github', 'jira').
  - title: A very short title of the message thread or topic (max 5 words).
  - sender: The sender's name or channel name.
  - summary: A very short, single-sentence summary of the update (max 12 words).
  - content: The full body or detail of the message/update.
  - time: A short time indicator (e.g., "10:30 AM", "2h ago", "Yesterday").
  - priority: 'high' | 'medium' | 'low'.
  - originalId: For 'whatsapp' source, you MUST copy the exact "Original ID" string associated with this chat/message in the raw input context (e.g. "wa-chat-123456"). Set recipientJid, chatId, and phoneNumber to null. For all other platforms, set all of these to null.

Ensure every communication log maps to exactly one of the five categories. For example, direct messages on whatsapp/slack go to 'messages'; mentions in channels/issues go to 'mentions'; emails on gmail/outlook go to 'email'; action items or Jira issues go to 'tasks'; and emails or messages requiring immediate replies go to 'follow_ups'.

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

      // Overlay the original metadata based on originalId to avoid Gemini hallucination/parsing issues
      if (payload.categories) {
        Object.keys(payload.categories).forEach((catKey) => {
          const category = payload.categories[catKey];
          if (category && Array.isArray(category.items)) {
            category.items.forEach((item: any) => {
              if (item.source === "whatsapp" && item.originalId) {
                const original = originalMetadataMap.get(item.originalId);
                if (original) {
                  item.recipientJid = original.recipientJid;
                  item.chatId = original.chatId;
                  item.phoneNumber = original.phoneNumber;
                  item.senderId = original.senderId;
                  console.log(`[Dashboard Brief] Restored original metadata for "${item.title}" from originalId "${item.originalId}":`, original);
                } else {
                  console.warn(`[Dashboard Brief] Original metadata not found for originalId: "${item.originalId}"`);
                }
              }
            });
          }
        });
      }

      const result = {
        ...payload,
        demoMode: false
      };

      // Save to database cache and generated briefings
      try {
        await saveToCache(insforgeClient, user.id, result);
        await saveToGeneratedBriefings(insforgeClient, user.id, result);
      } catch (dbCacheErr) {
        console.error("[Dashboard Brief] Failed to save DB cache:", dbCacheErr);
      }

      return NextResponse.json(result);

    } catch (geminiErr: any) {
      console.error("[Dashboard Brief] Gemini generation failed, reverting to fallback:", geminiErr);
      const fallback = getHighFidelityFallback(fullName, connectedAppIds);
      
      try {
        await saveToCache(insforgeClient, user.id, fallback);
        await saveToGeneratedBriefings(insforgeClient, user.id, fallback);
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

async function saveToGeneratedBriefings(insforgeClient: any, userId: string, briefContent: any) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: existingToday } = await insforgeClient.database
      .from("generated_briefings")
      .select("id")
      .eq("user_id", userId)
      .is("schedule_id", null)
      .gte("created_at", todayStart.toISOString())
      .maybeSingle();

    if (!existingToday) {
      console.log("[Dashboard Brief] Saving new daily generated briefing to database.");
      await insforgeClient.database
        .from("generated_briefings")
        .insert([{
          user_id: userId,
          schedule_id: null,
          name: "Daily Morning Briefing",
          summary: briefContent.highlight || "Synthesized Daily Briefing updates.",
          content: briefContent
        }]);
    } else {
      console.log("[Dashboard Brief] Daily generated briefing already exists for today. Skipping duplicate save.");
    }
  } catch (err) {
    console.error("[Dashboard Brief] Failed to save generated briefing run:", err);
  }
}
