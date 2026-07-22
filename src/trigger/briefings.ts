import { schedules, task } from "@trigger.dev/sdk/v3";
import { createClient } from "@insforge/sdk";
import { GoogleGenAI } from "@google/genai";

// Initialize InsForge client
const client = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "https://bwh9xism.us-east.insforge.app",
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "ik_2953fab02c96dcca63940dfc6ea1f77b",
});

const mockEmails = [
  {
    id: "msg-123",
    senderName: "Sarah Jenkins",
    senderEmail: "sarah.j@tech-ventures.com",
    subject: "URGENT: Q3 Roadmap Alignment & Client Deliverables",
    date: "July 9, 2026 10:42 AM",
    snippet: "Hi Team, following up on our sync yesterday. We need to finalize the Q3 roadmap deck...",
    body: "Hi Team,\n\nFollowing up on our sync yesterday. We need to finalize the Q3 roadmap presentation deck by Friday morning so we can share it with the client.\n\nAlso, please make sure the Figma links are updated on the main page. Diyad, can you review the security compliance section by tomorrow afternoon? Thanks!"
  },
  {
    id: "msg-456",
    senderName: "Google Cloud Platform",
    senderEmail: "gcp-billing@google.com",
    subject: "Alert: Cloud Billing Budget Threshold Exceeded (80%)",
    date: "July 8, 2026 4:15 PM",
    snippet: "Dear Customer, you are receiving this notification because your billing cost has exceeded 80%...",
    body: "Dear Customer,\n\nYou are receiving this notification because your Google Cloud Platform billing costs have exceeded 80% of your set budget threshold. Current usage stands at $402.15 against a budget of $500.00.\n\nPlease log into the GCP Console to review billing details and usage metrics."
  }
];

const mockWaChats = [
  {
    id: "wa-chat-1",
    name: "Marcus (Lead Dev)",
    unreadCount: 2,
    conversation: "Production deployment failed at step 4 due to database migration locks. The team is roll-backing. Direct contact requested if pipeline needs manual recovery override."
  },
  {
    id: "wa-chat-2",
    name: "Alice Johnson",
    unreadCount: 1,
    conversation: "Can you check the new onboarding screens on Figma? I made updates."
  }
];

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

    default:
      return "";
  }
}

// 1. Cron task that checks every 15 minutes
export const briefingCronTask = schedules.task({
  id: "briefing-cron-task",
  cron: "*/15 * * * *",
  run: async (payload) => {
    console.log("[Trigger.dev Cron] Checking briefing schedules...");
    const nowStr = new Date().toISOString();

    // Query due schedules
    const { data: schedulesDue, error } = await client.database
      .from("custom_briefing_schedules")
      .select("*")
      .lte("next_run_at", nowStr);

    if (error) {
      console.error("[Trigger.dev Cron] Failed to fetch briefing schedules:", error);
      return;
    }

    if (!schedulesDue || schedulesDue.length === 0) {
      console.log("[Trigger.dev Cron] No briefings are currently due.");
      return;
    }

    console.log(`[Trigger.dev Cron] Found ${schedulesDue.length} due briefing schedules.`);

    for (const schedule of schedulesDue) {
      // Trigger the asynchronous briefing generation task
      console.log(`[Trigger.dev Cron] Triggering briefing run for schedule ID: ${schedule.id} (${schedule.name})`);
      await generateScheduledBriefingTask.trigger({ scheduleId: schedule.id });

      // Calculate next run date
      const nextRun = new Date(schedule.next_run_at);
      if (schedule.frequency === "daily") {
        nextRun.setDate(nextRun.getDate() + 1);
      } else if (schedule.frequency === "weekly") {
        nextRun.setDate(nextRun.getDate() + 7);
      } else {
        nextRun.setDate(nextRun.getDate() + 1); // fallback to daily
      }

      // Update schedule details
      await client.database
        .from("custom_briefing_schedules")
        .update({
          last_run_at: nowStr,
          next_run_at: nextRun.toISOString(),
          updated_at: nowStr
        })
        .eq("id", schedule.id);
    }
  }
});

// 2. Queue task that processes a single briefing generation
export const generateScheduledBriefingTask = task({
  id: "generate-scheduled-briefing",
  run: async (payload: { scheduleId: string }) => {
    const { scheduleId } = payload;
    console.log(`[Trigger.dev Worker] Starting scheduled briefing generation for schedule: ${scheduleId}`);

    // Load schedule details
    const { data: schedule, error: scheduleErr } = await client.database
      .from("custom_briefing_schedules")
      .select("*")
      .eq("id", scheduleId)
      .maybeSingle();

    if (scheduleErr || !schedule) {
      console.error(`[Trigger.dev Worker] Schedule not found or DB query failed:`, scheduleErr);
      return;
    }

    const { user_id, name, selected_apps, selected_categories } = schedule;

    // Load profile to customize greeting
    const { data: profile } = await client.database
      .from("users")
      .select("name")
      .eq("id", user_id)
      .maybeSingle();

    const fullName = profile?.name || "Aura User";

    // Load user's integrations
    const { data: integrations } = await client.database
      .from("user_integrations")
      .select("*")
      .eq("user_id", user_id);

    const connectedApps = integrations?.filter(i => i.status === "connected").map(i => i.platform_id) || [];
    const appsToFetch = selected_apps.filter((appId: string) => connectedApps.includes(appId));

    let rawContext = "";
    let useRealData = false;
    let originalMetadata: Record<string, any> = {};

    try {
      console.log(`[Trigger.dev Worker] Querying localhost API for real user context: ${user_id}`);
      const localApiUrl = `http://localhost:3000/api/dashboard/brief?userId=${user_id}&raw=true`;
      const adminKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "ik_2953fab02c96dcca63940dfc6ea1f77b";

      const res = await fetch(localApiUrl, {
        headers: {
          "x-admin-key": adminKey
        }
      });

      if (res.ok) {
        const data = await res.json();
        rawContext = data.rawContext || "";
        originalMetadata = data.originalMetadata || {};
        console.log(`[Trigger.dev Worker] Real context data successfully compiled. Length: ${rawContext.length}`);
        useRealData = true;
      } else {
        console.warn(`[Trigger.dev Worker] Local API request failed: ${res.statusText}. Falling back to mocks.`);
      }
    } catch (fetchErr) {
      console.warn(`[Trigger.dev Worker] Failed to connect to local API:`, fetchErr, `. Falling back to mocks.`);
    }

    if (!useRealData) {
      console.log(`[Trigger.dev Worker] Compiling fallback mock data contexts...`);
      // Fetch fallback mock data for selected and connected apps
      for (const appId of selected_apps) {
        if (appId === "gmail") {
          rawContext += `\n--- Gmail Inbox (Recent Messages) ---\n`;
          mockEmails.forEach((msg) => {
            rawContext += `From: ${msg.senderName} (${msg.senderEmail})\n`;
            rawContext += `Date: ${msg.date}\n`;
            rawContext += `Subject: ${msg.subject}\n`;
            rawContext += `Content: ${msg.body || msg.snippet}\n\n`;
          });
        } else if (appId === "whatsapp") {
          rawContext += `\n--- WhatsApp Chats ---\n`;
          mockWaChats.forEach((chat) => {
            const tempId = `wa-chat-${chat.id}`;
            originalMetadata[tempId] = {
              recipientJid: "15550199@s.whatsapp.net",
              chatId: "15550199@s.whatsapp.net",
              phoneNumber: "+15550199231",
              senderId: "15550199@s.whatsapp.net"
            };
            rawContext += `Chat Name: ${chat.name} (Original ID: ${tempId})\n`;
            rawContext += `Unread messages: ${chat.unreadCount}\n`;
            rawContext += `Last Message Preview: ${chat.conversation}\n\n`;
          });
        } else {
          const platformContext = getMockPlatformContext(appId);
          if (platformContext) {
            rawContext += `\n--- Connected App: ${appId} ---\n${platformContext}\n\n`;
          }
        }
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Trigger.dev Worker] GEMINI_API_KEY is not defined. Briefing generation aborted.");
      return;
    }

    try {
      console.log("[Trigger.dev Worker] Calling Gemini model gemini-3.1-flash-lite...");
      const ai = new GoogleGenAI({ apiKey });

      const allowedCats = selected_categories.length > 0 ? selected_categories : ["email", "messages", "mentions", "tasks", "follow_ups"];

      const systemPrompt = `You are Aura, an elite AI personal assistant. You analyze the user's communications, message logs, and updates across connected workspaces to generate a personalized briefing.
Based on the provided communications, synthesize a morning brief for schedule name "${name}".

You must output a strictly structured JSON response containing:
- welcomeMessage: A custom welcome greeting mentioning the user's name "${fullName}" and summarizing the level of activity in their inbox in a friendly but executive tone (e.g. "Welcome back, John! Your custom morning brief is ready.").
- highlight: A single sentence summarizing the most critical update of the day.
- categories: An object containing grouping categories. ONLY include the following categories: ${allowedCats.join(", ")}. If you find no items for an allowed category, return count 0 and empty items list.
  Each category must be structured as:
  - count: (number of items)
  - summary: (short summary sentence of this category's updates)
  - items: (array of items)

Each item in any category's 'items' array must have:
  - id: A unique string ID (e.g. "item-1", "item-2").
  - source: The platform name lowercase (must be one of: 'gmail', 'whatsapp', 'slack', 'outlook', 'discord', 'linkedin', 'telegram', 'notion', 'github', 'jira').
  - title: A very short title of the message thread or topic (max 5 words).
  - sender: The sender's name or channel name.
  - summary: A very short, single-sentence summary of the update (max 12 words).
  - content: The full body or detail of the message/update.
  - time: A short time indicator (e.g., "10:30 AM", "2h ago", "Yesterday").
  - priority: 'high' | 'medium' | 'low'.
  - originalId: For 'whatsapp' source, you MUST copy the exact "Original ID" string associated with this chat/message in the raw input context (e.g. "wa-chat-123456"). Set recipientJid, chatId, and phoneNumber to null. For other platforms, set all of these to null.

Make sure the summary and items reflect the selected categories and connected apps.

CRITICAL: Return only raw, valid JSON. Do not include markdown code block formatting. Output directly.`;

      const contents = `Here is the current date and time: ${new Date().toISOString()}
User Name: ${fullName}
Custom Briefing Schedule: ${name}
Selected Apps: ${selected_apps.join(", ")}
Selected Categories: ${selected_categories.join(", ")}

Raw platform data logs:
${rawContext || "No messages or updates."}`;

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

      // Overlay original metadata based on originalId to avoid Gemini hallucination/parsing issues
      if (payload.categories) {
        Object.keys(payload.categories).forEach((catKey) => {
          const category = payload.categories[catKey];
          if (category && Array.isArray(category.items)) {
            category.items.forEach((item: any) => {
              if (item.source === "whatsapp" && item.originalId) {
                const original = originalMetadata[item.originalId];
                if (original) {
                  item.recipientJid = original.recipientJid;
                  item.chatId = original.chatId;
                  item.phoneNumber = original.phoneNumber;
                  item.senderId = original.senderId;
                  console.log(`[Trigger.dev Worker] Overwrote metadata for WhatsApp item "${item.title}" from originalId "${item.originalId}":`, original);
                } else {
                  console.warn(`[Trigger.dev Worker] Original metadata not found for originalId: "${item.originalId}"`);
                }
              }
            });
          }
        });
      }
      
      // Save generated briefing to DB
      console.log(`[Trigger.dev Worker] Saving custom briefing to public.generated_briefings...`);
      await client.database
        .from("generated_briefings")
        .insert([{
          user_id,
          schedule_id: scheduleId,
          name,
          summary: payload.highlight || "Custom briefing updates.",
          content: payload
        }]);

      console.log(`[Trigger.dev Worker] Completed briefing generation for schedule ${scheduleId} successfully.`);

    } catch (geminiErr: any) {
      console.error("[Trigger.dev Worker] Gemini briefing generation failed:", geminiErr);
    }
  }
});
