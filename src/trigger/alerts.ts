import { schedules, task } from "@trigger.dev/sdk/v3";
import { createClient } from "@insforge/sdk";
import { GoogleGenAI } from "@google/genai";

// Initialize InsForge client (service-level, no user token)
const client = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "https://bwh9xism.us-east.insforge.app",
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "ik_2953fab02c96dcca63940dfc6ea1f77b",
});

// --- Mock data sources (same pattern as briefings, with future MCP integration points) ---

const mockAppData: Record<string, () => any[]> = {
  gmail: () => [
    {
      id: "email-urgent-1",
      sender: "CEO (John Miller)",
      senderEmail: "john@company.com",
      subject: "URGENT: Board meeting prep — need your input ASAP",
      body: "Hi, I need the updated metrics dashboard shared with the board by 4 PM today. Please prioritize this.",
      time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      priority: "critical",
    },
    {
      id: "email-security-1",
      sender: "Google Security",
      senderEmail: "no-reply@accounts.google.com",
      subject: "Security Alert: New sign-in from unrecognized device",
      body: "A new sign-in to your Google Account was detected from Chrome on Windows (IP: 203.0.113.45). If this wasn't you, secure your account.",
      time: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      priority: "high",
    },
    {
      id: "email-billing-1",
      sender: "AWS Billing",
      senderEmail: "billing@aws.amazon.com",
      subject: "Alert: Monthly spend exceeded 90% of budget",
      body: "Your AWS account spend has reached $4,502 against a $5,000 budget threshold.",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      priority: "high",
    },
  ],
  whatsapp: () => [
    {
      id: "wa-msg-1",
      sender: "Marcus (Lead Dev)",
      phone: "+15551234567",
      message: "Production deployment failed at stage 3. Database migration locks detected. Needs your immediate attention for rollback decision.",
      time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      priority: "critical",
    },
    {
      id: "wa-msg-2",
      sender: "Sarah (PM)",
      phone: "+15559876543",
      message: "Client meeting moved to 3 PM today. Can you confirm attendance?",
      time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      priority: "medium",
    },
  ],
  slack: () => [
    {
      id: "slack-mention-1",
      channel: "#engineering",
      sender: "alice.dev",
      message: "@you API rate limiting is causing 429 errors in production. We need to adjust the throttle config.",
      time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      priority: "high",
    },
    {
      id: "slack-dm-1",
      channel: "Direct Message",
      sender: "HR Bot",
      message: "Reminder: Open enrollment for benefits closes Friday at 5 PM.",
      time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      priority: "low",
    },
  ],
  github: () => [
    {
      id: "gh-pr-1",
      type: "pull_request",
      repo: "aura/core-api",
      title: "PR #215: Fix WebSocket reconnect loop",
      author: "marcus-dev",
      message: "Review requested. This fixes the infinite reconnection issue in production.",
      time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      priority: "high",
    },
    {
      id: "gh-issue-1",
      type: "issue",
      repo: "aura/core-api",
      title: "Issue #89: Database lock during migration",
      author: "automated",
      message: "Critical issue opened. Migration script locks table for extended periods.",
      time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      priority: "critical",
    },
  ],
  jira: () => [
    {
      id: "jira-1",
      key: "AURA-402",
      title: "Setup Stripe Webhooks for Billing Portal",
      status: "IN PROGRESS",
      assignee: "you",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: "high",
    },
  ],
};

// --- Condition evaluators ---

function evaluateCondition(
  condition: string,
  config: any,
  appData: any[]
): any[] {
  const matches: any[] = [];

  switch (condition) {
    case "keyword_match": {
      const keywords = (config.keywords || []).map((k: string) => k.toLowerCase());
      for (const item of appData) {
        const text = `${item.subject || ""} ${item.message || ""} ${item.body || ""} ${item.title || ""}`.toLowerCase();
        if (keywords.some((kw: string) => text.includes(kw))) {
          matches.push(item);
        }
      }
      break;
    }
    case "priority_sender": {
      const senders = (config.senders || []).map((s: string) => s.toLowerCase());
      for (const item of appData) {
        const sender = `${item.sender || ""} ${item.senderEmail || ""} ${item.author || ""}`.toLowerCase();
        if (senders.some((s: string) => sender.includes(s))) {
          matches.push(item);
        }
      }
      break;
    }
    case "mention": {
      const mentionTerms = (config.terms || ["@you", "@diyad"]).map((t: string) => t.toLowerCase());
      for (const item of appData) {
        const text = `${item.message || ""} ${item.body || ""} ${item.title || ""}`.toLowerCase();
        if (mentionTerms.some((term: string) => text.includes(term))) {
          matches.push(item);
        }
      }
      break;
    }
    case "unread_threshold": {
      const threshold = config.threshold || 5;
      if (appData.length >= threshold) {
        matches.push(...appData.slice(0, threshold));
      }
      break;
    }
    case "high_priority": {
      for (const item of appData) {
        if (item.priority === "critical" || item.priority === "high") {
          matches.push(item);
        }
      }
      break;
    }
    case "deadline_approaching": {
      const hoursAhead = config.hours_ahead || 24;
      const cutoff = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
      for (const item of appData) {
        if (item.dueDate && new Date(item.dueDate) <= cutoff) {
          matches.push(item);
        }
      }
      break;
    }
    default:
      // Default: match all high-priority items
      matches.push(...appData.filter((i) => i.priority === "critical" || i.priority === "high"));
  }

  return matches;
}

// --- Cron task: runs every 5 minutes ---

export const alertMonitorCronTask = schedules.task({
  id: "alert-monitor-cron",
  cron: "*/5 * * * *",
  run: async () => {
    console.log("[Trigger.dev Alerts] Running alert monitor cron...");

    // Fetch all active alert rules
    const { data: activeRules, error } = await client.database
      .from("user_alerts")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("[Trigger.dev Alerts] Failed to fetch alert rules:", error);
      return;
    }

    if (!activeRules || activeRules.length === 0) {
      console.log("[Trigger.dev Alerts] No active alert rules found.");
      return;
    }

    console.log(`[Trigger.dev Alerts] Processing ${activeRules.length} active rules...`);

    for (const rule of activeRules) {
      // Check frequency — skip non-realtime rules that aren't due
      if (rule.frequency === "hourly") {
        const lastCheck = rule.updated_at ? new Date(rule.updated_at) : new Date(0);
        if (Date.now() - lastCheck.getTime() < 55 * 60 * 1000) continue;
      }
      if (rule.frequency === "daily") {
        const lastCheck = rule.updated_at ? new Date(rule.updated_at) : new Date(0);
        if (Date.now() - lastCheck.getTime() < 23 * 60 * 60 * 1000) continue;
      }

      await processAlertRuleTask.trigger({
        ruleId: rule.id,
        userId: rule.user_id,
      });
    }
  },
});

// --- Standalone rule evaluation helper (callable from API or worker) ---

export async function evaluateAlertRule(ruleId: string, userId: string): Promise<void> {
  console.log(`[Alert Rule Evaluation] Processing rule ${ruleId} for user ${userId}`);

  // Load the rule
  const { data: rule, error: ruleErr } = await client.database
    .from("user_alerts")
    .select("*")
    .eq("id", ruleId)
    .maybeSingle();

  if (ruleErr || !rule) {
    console.error("[Alert Rule Evaluation] Rule not found:", ruleErr);
    return;
  }

  const selectedApps: string[] = rule.selected_apps || [];
  const condition = rule.trigger_condition;
  const config = rule.trigger_config || {};

  // Collect data from selected apps
  let allMatches: { app: string; item: any }[] = [];

  for (const appId of selectedApps) {
    const dataFn = mockAppData[appId];
    if (!dataFn) continue;

    const appData = dataFn();
    const matches = evaluateCondition(condition, config, appData);

    for (const match of matches) {
      allMatches.push({ app: appId, item: match });
    }
  }

  if (allMatches.length === 0) {
    console.log(`[Alert Rule Evaluation] No matches for rule "${rule.name}"`);
    // Update last check time
    await client.database
      .from("user_alerts")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", ruleId);
    return;
  }

  console.log(`[Alert Rule Evaluation] Found ${allMatches.length} matches for rule "${rule.name}"`);

  // Check for duplicate alerts (avoid re-triggering for the same content)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: recentAlerts } = await client.database
    .from("triggered_alerts")
    .select("dedupe_key")
    .eq("user_id", userId)
    .eq("alert_id", ruleId)
    .gte("created_at", fiveMinutesAgo);

  const recentDedupeKeys = new Set(
    (recentAlerts || []).map((a: any) => a.dedupe_key).filter(Boolean)
  );

  // Insert triggered alerts for new matches
  const newAlerts: any[] = [];
  for (const { app, item } of allMatches) {
    const title = item.subject || item.title || item.message?.substring(0, 50) || "Alert Triggered";
    const sourceId = item.id ? String(item.id) : null;
    const dedupeKey = sourceId ? `${userId}:${ruleId}:${app}:${sourceId}` : null;

    if (dedupeKey && recentDedupeKeys.has(dedupeKey)) continue; // Skip duplicate

    newAlerts.push({
      user_id: userId,
      alert_id: ruleId,
      source_app: app,
      title,
      description: item.message || item.body || item.title || "",
      full_content: item,
      priority: item.priority || rule.priority || "medium",
      status: "active",
      source_id: sourceId,
      dedupe_key: dedupeKey,
      ai_data: {},
    });
  }

  if (newAlerts.length === 0) {
    console.log(`[Alert Rule Evaluation] All matches already triggered recently. Skipping.`);
    await client.database
      .from("user_alerts")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", ruleId);
    return;
  }

  // Insert new triggered alerts
  const { error: insertErr } = await client.database
    .from("triggered_alerts")
    .upsert(newAlerts, { onConflict: "dedupe_key" });

  if (insertErr) {
    console.error("[Alert Rule Evaluation] Failed to insert triggered alerts:", insertErr);
    return;
  }

  console.log(`[Alert Rule Evaluation] Inserted/Upserted ${newAlerts.length} triggered alerts.`);

  // Generate AI enrichment for the first few alerts
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && newAlerts.length > 0) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      // Get the inserted alert IDs
      const { data: insertedAlerts } = await client.database
        .from("triggered_alerts")
        .select("id, title, description, source_app, priority, ai_data")
        .eq("user_id", userId)
        .eq("alert_id", ruleId)
        .order("created_at", { ascending: false })
        .limit(newAlerts.length);

      for (const alert of (insertedAlerts || []).slice(0, 3)) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: `Summarize this alert in 1 concise sentence and suggest one action:

Title: ${alert.title}
Description: ${alert.description}
Source: ${alert.source_app}
Priority: ${alert.priority}

Return JSON: {"summary": "...", "action": "..."}`,
            config: {
              systemInstruction: "You are Aura AI. Return only valid JSON with summary and action fields.",
              responseMimeType: "application/json",
            },
          });

          const text = response?.text || "{}";
          const parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/, "").trim());

          const currentAiData = alert.ai_data || {};
          const updatedAiData = {
            ...currentAiData,
            summary: parsed.summary || "",
            action: parsed.action || "",
          };

          await client.database
            .from("triggered_alerts")
            .update({
              ai_data: updatedAiData,
            })
            .eq("id", alert.id);

          console.log(`[Alert Rule Evaluation] AI enrichment added for alert "${alert.title}"`);
        } catch (aiErr) {
          console.warn(`[Alert Rule Evaluation] AI enrichment failed for alert ${alert.id}:`, aiErr);
        }
      }
    } catch (err) {
      console.warn("[Alert Rule Evaluation] AI enrichment setup failed:", err);
    }
  }

  // Update last check time
  await client.database
    .from("user_alerts")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", ruleId);

  console.log(`[Alert Rule Evaluation] Completed processing rule "${rule.name}".`);
}

// --- Queue task: process a single alert rule ---

export const processAlertRuleTask = task({
  id: "process-alert-rule",
  run: async (payload: { ruleId: string; userId: string }) => {
    const { ruleId, userId } = payload;
    await evaluateAlertRule(ruleId, userId);
  },
});
