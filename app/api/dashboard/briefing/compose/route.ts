import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@insforge/sdk";

export async function POST(req: NextRequest) {
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

    const { itemContext, prompt: userPrompt } = await req.json();

    if (!itemContext) {
      return NextResponse.json({ error: "Missing itemContext" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are Aura, an elite AI personal assistant.
The user wants to write a reply or a message based on the following briefing update context:
---
Source Platform: ${itemContext.source || "Unknown"}
Sender/Author: ${itemContext.sender || "Unknown"}
Topic: ${itemContext.title || "Unknown"}
Content Details: ${itemContext.content || itemContext.summary || "No content details provided."}
---

Your task is to compose a professional, highly relevant, and contextual draft response.
${userPrompt ? `Follow these specific user instructions for the response:\n"${userPrompt}"` : "Draft a helpful, professional reply addressing the context."}

CRITICAL: Return ONLY the raw drafted message text. Do NOT wrap it in any formatting (no markdown blocks like \`\`\` or metadata). Just return the direct email body or chat message.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: "Draft the response based on system instructions.",
      config: {
        systemInstruction: systemPrompt
      }
    });

    const draftText = response.text || "";
    return NextResponse.json({ draft: draftText.trim() });

  } catch (error: any) {
    console.error("[Briefing Compose Exception]:", error);
    return NextResponse.json({ error: error.message || "An error occurred generating draft" }, { status: 500 });
  }
}
