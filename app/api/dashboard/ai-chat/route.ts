import { NextRequest } from "next/server";
import { createClient } from "@insforge/sdk";
import { GoogleGenAI, Type } from "@google/genai";
import { WhatsAppService } from "@/lib/whatsapp-service";

export const dynamic = "force-dynamic";

// ── WhatsApp tool definitions for Gemini function calling ───────────────────
const whatsappTools: Array<{
  name: string;
  description: string;
  parameters: { type: Type; properties: Record<string, { type: Type; description: string }>; required?: string[] };
}> = [
  {
    name: "whatsapp_get_chats",
    description: "Get the list of recent WhatsApp chats with chat names, unread counts, and last message previews. Use this to answer questions about recent conversations, who messaged the user, or what chats are active.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.NUMBER, description: "Maximum number of chats to return. Default 20." },
      },
    },
  },
  {
    name: "whatsapp_get_messages",
    description: "Get the full message history for a specific WhatsApp chat by chatId. Use this when the user asks about a specific conversation, what someone said, or to read a chat.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        chatId: { type: Type.STRING, description: "The WhatsApp chat ID (e.g. 919876543210@s.whatsapp.net for contacts, 120363...@g.us for groups)" },
        limit: { type: Type.NUMBER, description: "Maximum messages to return. Default 30." },
      },
      required: ["chatId"],
    },
  },
  {
    name: "whatsapp_get_all_messages",
    description: "Get the most recent messages across ALL WhatsApp chats, sorted newest first. Use this to answer 'what was the last message I received', 'who messaged me today', or 'show my recent messages'.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.NUMBER, description: "Maximum messages to return across all chats. Default 30." },
      },
    },
  },
  {
    name: "whatsapp_get_unread_messages",
    description: "Get all unread WhatsApp messages grouped by chat, including the actual message text. Use this to answer 'summarize my unread WhatsApp', 'what messages haven't I read', or 'show unread messages'.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "whatsapp_search_messages",
    description: "Search WhatsApp message history for a keyword or phrase across all chats. Use this when user asks to 'find', 'search', or 'look for' specific content in messages.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "The keyword or phrase to search for in messages." },
        limit: { type: Type.NUMBER, description: "Maximum results to return. Default 20." },
      },
      required: ["query"],
    },
  },
];

// ── Execute a WhatsApp tool call ─────────────────────────────────────────────
function executeWhatsAppTool(userId: string, toolName: string, args: Record<string, any>): string {
  const waService = WhatsAppService.getInstance();

  if (!waService.hasData(userId)) {
    return JSON.stringify({
      note: "WhatsApp message store is empty. This usually means either: (1) WhatsApp is not connected, (2) the server was recently restarted and no messages have arrived yet, or (3) no messages have been received since connection.",
      hasData: false,
    });
  }

  switch (toolName) {
    case "whatsapp_get_chats": {
      const limit = args.limit || 20;
      const chats = waService.getChats(userId, limit);
      return JSON.stringify({
        count: chats.length,
        chats: chats.map(c => ({
          id: c.id,
          name: c.name,
          isGroup: c.isGroup,
          unreadCount: c.unreadCount,
          lastMessage: c.lastMessage,
          lastMessageTime: new Date(c.lastMessageTime * 1000).toLocaleString(),
        })),
      });
    }

    case "whatsapp_get_messages": {
      const limit = args.limit || 30;
      const messages = waService.getMessages(userId, args.chatId, limit);
      // Find chat name
      const chats = waService.getChats(userId, 100);
      const chat = chats.find(c => c.id === args.chatId);
      return JSON.stringify({
        chatId: args.chatId,
        chatName: chat?.name || args.chatId,
        count: messages.length,
        messages: messages.map(m => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          timestamp: new Date(m.timestamp * 1000).toLocaleString(),
          fromMe: m.fromMe,
          type: m.messageType,
          isRead: m.isRead,
        })),
      });
    }

    case "whatsapp_get_all_messages": {
      const limit = args.limit || 30;
      const messages = waService.getAllMessages(userId, limit);
      return JSON.stringify({
        count: messages.length,
        messages: messages.map(m => ({
          id: m.id,
          chatId: m.chatId,
          chatName: m.chatName,
          sender: m.sender,
          text: m.text,
          timestamp: new Date(m.timestamp * 1000).toLocaleString(),
          fromMe: m.fromMe,
          type: m.messageType,
          isRead: m.isRead,
        })),
      });
    }

    case "whatsapp_get_unread_messages": {
      const unread = waService.getUnreadMessages(userId);
      return JSON.stringify({
        totalUnreadChats: unread.length,
        totalUnreadMessages: unread.reduce((s, r) => s + r.messages.length, 0),
        unread: unread.map(r => ({
          chat: {
            id: r.chat.id,
            name: r.chat.name,
            isGroup: r.chat.isGroup,
            unreadCount: r.chat.unreadCount,
          },
          messages: r.messages.map(m => ({
            sender: m.sender,
            text: m.text,
            timestamp: new Date(m.timestamp * 1000).toLocaleString(),
            type: m.messageType,
          })),
        })),
      });
    }

    case "whatsapp_search_messages": {
      const limit = args.limit || 20;
      const results = waService.searchMessages(userId, args.query, limit);
      return JSON.stringify({
        query: args.query,
        count: results.length,
        messages: results.map(m => ({
          chatName: m.chatName,
          sender: m.sender,
          text: m.text,
          timestamp: new Date(m.timestamp * 1000).toLocaleString(),
          fromMe: m.fromMe,
        })),
      });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.replace("Bearer ", "").trim();

        if (!token) {
          send({ error: "Unauthorized: Missing auth token" });
          controller.close();
          return;
        }

        const insforgeClient = createClient({
          baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
          anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
          accessToken: token,
        });

        const { data: userData, error: authError } =
          await insforgeClient.auth.getCurrentUser();
        if (authError || !userData?.user) {
          send({ error: "Unauthorized: Invalid session" });
          controller.close();
          return;
        }

        const user = userData.user;
        const body = await req.json();
        const { message, history } = body;

        if (!message || typeof message !== "string") {
          send({ error: "Invalid message" });
          controller.close();
          return;
        }

        // Fetch user profile
        const { data: profile } = await insforgeClient.database
          .from("users")
          .select("name")
          .eq("id", user.id)
          .maybeSingle();

        const fullName =
          profile?.name || user.email?.split("@")[0] || "Aura User";

        // Fetch connected integrations
        let integrationsContext = "No integrations connected.";
        try {
          const { data: integrations } = await insforgeClient.database
            .from("user_integrations")
            .select("platform_id, status, synced_count, settings")
            .eq("user_id", user.id)
            .eq("status", "connected");

          if (integrations && integrations.length > 0) {
            integrationsContext = integrations
              .map(
                (i: any) =>
                  `${i.platform_id} (${i.synced_count || 0} items synced)`
              )
              .join(", ");
          }
        } catch {}

        // Fetch latest cached workspace info
        let briefContext = "No daily brief data cached.";
        let priorityContext = "No priority items cached.";
        try {
          const { data: cacheRow } = await insforgeClient.database
            .from("dashboard_cache")
            .select("brief_content, priority_content")
            .eq("user_id", user.id)
            .maybeSingle();

          if (cacheRow) {
            if (cacheRow.brief_content)
              briefContext = JSON.stringify(cacheRow.brief_content);
            if (cacheRow.priority_content)
              priorityContext = JSON.stringify(cacheRow.priority_content);
          }
        } catch {}

        // WhatsApp connection status (quick check — data fetched via tools)
        const waService = WhatsAppService.getInstance();
        const waHasData = waService.hasData(user.id);
        const waChats = waService.getChats(user.id, 5);
        const waStatusLine = waHasData
          ? `WhatsApp is connected and has data. ${waChats.length} recent chats available. Use WhatsApp tools to fetch actual messages.`
          : "WhatsApp may be connected but the message store is empty (server may have restarted — messages populate as they arrive).";

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
          send({
            token:
              "Aura is running in sandbox mode — no Gemini API key configured. Please add `GEMINI_API_KEY` to `.env.local` to enable real AI responses.",
          });
          send({ done: true, suggestions: [] });
          controller.close();
          return;
        }

        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `You are Aura, an elite personal AI assistant. You help ${fullName} manage their workspace, connected apps, and daily priorities.

Connected Apps & Integrations: ${integrationsContext}

Daily Brief Context: ${briefContext}

Priority Items Context: ${priorityContext}

WhatsApp Status: ${waStatusLine}

Current Date/Time: ${new Date().toISOString()}

Instructions:
- Be conversational, helpful, and professional.
- Format responses using Markdown (headings, bullet lists, code blocks, bold, italics, tables) where appropriate.
- You have access to WhatsApp tools. When the user asks about WhatsApp messages, conversations, or contacts, ALWAYS call the appropriate WhatsApp tool to fetch real data before answering.
- After calling a tool, interpret the results naturally in your response — don't just dump raw JSON.
- Use emojis sparingly and naturally.
- If a tool returns no data, explain why honestly (e.g. store is empty, needs reconnection, etc.).
- End responses with actionable next steps when relevant.
- Keep answers concise but complete.`;

        // Build conversation history for Gemini
        const contents: any[] = [];

        if (history && Array.isArray(history)) {
          for (const msg of history) {
            contents.push({
              role: msg.sender === "user" ? "user" : "model",
              parts: [{ text: msg.text }],
            });
          }
        }

        // Add current user message
        contents.push({
          role: "user",
          parts: [{ text: message }],
        });

        // ── Agentic loop: Gemini calls tools until it produces a final text response ──
        let fullText = "";
        let loopCount = 0;
        const MAX_TOOL_ROUNDS = 5;

        while (loopCount < MAX_TOOL_ROUNDS) {
          loopCount++;

          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents,
            config: {
              systemInstruction,
              temperature: 0.75,
              tools: [{ functionDeclarations: whatsappTools }],
            },
          });

          const candidate = response.candidates?.[0];
          if (!candidate) break;

          const parts = candidate.content?.parts || [];
          const toolCalls = parts.filter((p: any) => p.functionCall);
          const textParts = parts.filter((p: any) => p.text);

          if (toolCalls.length > 0) {
            // Execute all tool calls and feed results back
            const toolResultParts: any[] = [];

            for (const part of toolCalls) {
              const fn = part.functionCall;
              if (!fn?.name) continue;
              console.log(`[AI Chat] Executing WhatsApp tool: ${fn.name}`, fn.args);
              const result = executeWhatsAppTool(user.id, fn.name, fn.args || {});
              toolResultParts.push({
                functionResponse: {
                  name: fn.name,
                  response: { content: result },
                },
              });
            }

            // Add model's tool call turn + tool results to conversation
            contents.push({ role: "model", parts });
            contents.push({ role: "user", parts: toolResultParts });
            continue; // loop again so model can process results
          }

          // Model returned a final text response — stream it
          const finalText = textParts.map((p: any) => p.text).join("");
          if (finalText) {
            // Simulate streaming by chunking text into ~50 char pieces
            const chunkSize = 50;
            for (let i = 0; i < finalText.length; i += chunkSize) {
              const chunk = finalText.slice(i, i + chunkSize);
              fullText += chunk;
              send({ token: chunk });
              // Small delay to give the client time to render
              await new Promise(r => setTimeout(r, 10));
            }
          }
          break;
        }

        // Generate quick reply suggestions
        let suggestions: string[] = [];
        try {
          const suggestionPrompt = `Based on this AI assistant response, suggest 3 short follow-up questions the user might ask. Return ONLY a JSON array of strings, no other text. Response was: "${fullText.slice(0, 500)}"`;
          const suggResp = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: suggestionPrompt,
            config: {
              temperature: 0.6,
              responseMimeType: "application/json",
            },
          });
          const raw = suggResp.text?.trim() || "[]";
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            suggestions = parsed.slice(0, 3);
          }
        } catch {
          suggestions = [
            "Tell me more about this",
            "What should I do next?",
            "Summarize the key points",
          ];
        }

        send({ done: true, suggestions });
        controller.close();
      } catch (error: any) {
        console.error("[AI Chat API Exception]:", error);
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message || "An unexpected error occurred" })}\n\n`
            )
          );
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
