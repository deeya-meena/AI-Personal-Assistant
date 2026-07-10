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

    // 1. Authenticate user from the Authorization header
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

    // 2. Fetch integration record from DB
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
      // Sandbox fallback: return success instantly
      console.log(`[Gmail Draft Sandbox] Mocking draft creation to ${to} for user: ${user.id}`);
      return NextResponse.json({ success: true, draftId: "draft_mock_98aF412b", mode: "sandbox" });
    }

    // 3. Handle Production API Flow
    let accessToken = settings.access_token;
    const refreshToken = settings.refresh_token;
    const expiryDate = settings.expiry_date;

    // Refresh token if expired or near expiration (within 30 seconds)
    if (refreshToken && expiryDate && Date.now() > (expiryDate - 30 * 1000)) {
      try {
        console.log(`[Gmail Draft] Token expired for user ${user.id}. Refreshing...`);
        const refreshed = await refreshGoogleAccessToken(refreshToken);
        accessToken = refreshed.access_token;
        
        // Update database settings with new access token
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
        console.error("[Gmail Draft] Failed to refresh Google credentials:", refreshErr);
        return NextResponse.json({ error: "Google connection expired. Please reconnect Gmail." }, { status: 403 });
      }
    }

    // 4. Construct RFC 2822 raw message
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

    // Add spacer line before body
    emailParts.push("");
    emailParts.push(body);

    const rawMessage = emailParts.join("\r\n");

    // Base64URL encode the raw MIME message safely
    const base64UrlSafe = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // 5. Send post request to Google Drafts API
    console.log(`[Gmail Draft Real] Creating draft to ${to} for user: ${user.id}`);
    const draftPayload = {
      message: {
        raw: base64UrlSafe,
        ...(threadId ? { threadId } : {})
      }
    };

    const draftResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(draftPayload)
    });

    const draftData = await draftResponse.json();

    if (!draftResponse.ok) {
      console.error("[Gmail Draft Error] Google Draft API failed:", draftData);
      return NextResponse.json({ error: draftData.error?.message || "Failed to create draft in Gmail API" }, { status: draftResponse.status });
    }

    // Update synced count in database
    await insforgeClient.database
      .from("user_integrations")
      .update({
        synced_count: (integration.synced_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", integration.id);

    return NextResponse.json({ success: true, draftId: draftData.id, mode: "production" });

  } catch (error: any) {
    console.error("[Gmail Draft API Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
