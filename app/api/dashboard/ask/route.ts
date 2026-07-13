import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { GoogleGenAI } from "@google/genai";

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

    const user = userData.user;
    const body = await req.json();
    const { question } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }

    // Fetch user profile from DB to get real name
    const { data: profile } = await insforgeClient.database
      .from("users")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    const fullName = profile?.name || user.email?.split("@")[0] || "Aura User";

    // Fetch latest cached workspace info for contextual answers
    let briefContext = "No daily brief data cached.";
    let priorityContext = "No priority items cached.";

    try {
      const { data: cacheRow } = await insforgeClient.database
        .from("dashboard_cache")
        .select("brief_content, priority_content")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cacheRow) {
        if (cacheRow.brief_content) {
          briefContext = JSON.stringify(cacheRow.brief_content);
        }
        if (cacheRow.priority_content) {
          priorityContext = JSON.stringify(cacheRow.priority_content);
        }
      }
    } catch (cacheErr) {
      console.error("[Dashboard Ask API] Cache fetch error:", cacheErr);
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return sandbox fallback response
      return NextResponse.json({
        answer: "Aura is currently running in sandbox mode without a Gemini API Key. To enable AI answers, please connect your GEMINI_API_KEY in the workspace .env.local file.",
        demoMode: true
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are Aura, an elite AI personal assistant. You help the user manage their workspace, connected apps, and daily priorities.
Answer the user's question. Use the following cached daily workspace contexts if relevant:

User's Name: ${fullName}
Daily Brief Cached Context: ${briefContext}
Priority Items Cached Context: ${priorityContext}

Instructions:
- Provide a clear, premium, and helpful answer.
- Keep the response short and quick to read (max 2-3 sentences).
- If the question is about their tasks, schedule, or apps, refer to the provided contexts.
- Maintain an encouraging and professional assistant tone.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    return NextResponse.json({
      answer: response.text || "I was unable to compile an answer at this moment.",
      demoMode: false
    });

  } catch (error: any) {
    console.error("[Dashboard Ask API Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
