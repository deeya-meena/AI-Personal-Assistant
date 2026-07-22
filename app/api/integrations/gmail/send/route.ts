import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";

async function refreshGoogleAccessToken(refreshToken: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || "Google OAuth token refresh failed");
  }

  return {
    access_token: data.access_token,
    expires_in: data.expires_in
  };
}

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body, threadId } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing recipient (to), subject, or email body" }, { status: 400 });
    }

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

    const { data: integration, error: dbError } = await insforgeClient.database
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform_id", "gmail")
      .maybeSingle();

    if (dbError || !integration || integration.status !== "connected") {
      return NextResponse.json({ error: "Gmail is not connected for this user" }, { status: 400 });
    }

    const settings = integration.settings as any;

    if (!settings || settings.mode === "sandbox") {
      console.log(`[Gmail Send Sandbox] Mocking email send to ${to} for user: ${user.id}`);
      return NextResponse.json({ success: true, messageId: "msg_mock_39bE492a", mode: "sandbox" });
    }

    let accessToken = settings.access_token;
    const refreshToken = settings.refresh_token;
    const expiryDate = settings.expiry_date;

    if (refreshToken && expiryDate && Date.now() > (expiryDate - 30 * 1000)) {
      try {
        console.log(`[Gmail Send] Token expired for user ${user.id}. Refreshing...`);
        const refreshed = await refreshGoogleAccessToken(refreshToken);
        accessToken = refreshed.access_token;
        
        const newSettings = {
          ...settings,
          access_token: refreshed.access_token,
          expiry_date: Date.now() + refreshed.expires_in * 1000
        };

        await insforgeClient.database
          .from("user_integrations")
          .update({
            settings: newSettings,
            updated_at: new Date().toISOString()
          })
          .eq("id", integration.id);

      } catch (refreshErr: any) {
        console.error("[Gmail Send] Failed to refresh Google credentials:", refreshErr);
        return NextResponse.json({ error: "Google connection expired. Please reconnect Gmail." }, { status: 403 });
      }
    }

    // Construct RFC 2822 raw message
    const emailParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
    ];

    if (threadId) {
      emailParts.push(`In-Reply-To: ${threadId}`);
      emailParts.push(`References: ${threadId}`);
    }

    emailParts.push("");
    emailParts.push(body);

    const rawMessage = emailParts.join("\r\n");

    const base64UrlSafe = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    console.log(`[Gmail Send Real] Sending email to ${to} for user: ${user.id}`);
    const sendPayload = {
      raw: base64UrlSafe,
      ...(threadId ? { threadId } : {})
    };

    const sendResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sendPayload)
    });

    const sendData = await sendResponse.json();
    if (!sendResponse.ok) {
      console.error("[Gmail Send Real] Gmail API error:", sendData);
      return NextResponse.json({ error: sendData.error?.message || "Failed to send email via Gmail API" }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: sendData.id, threadId: sendData.threadId });

  } catch (error: any) {
    console.error("[Gmail Send Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
