import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";

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
  },
  {
    id: "msg-789",
    senderName: "Workday Portal",
    senderEmail: "hr-benefits@auth.aura.ai",
    subject: "Action Required: Health Insurance Open Enrollment Closing",
    date: "July 8, 2026 9:00 AM",
    snippet: "Dear Employee, this is a final reminder that the annual open enrollment window closes...",
    body: "Dear Employee,\n\nThis is a final reminder that the annual benefits open enrollment window closes on July 10th at 11:59 PM. If you do not submit your enrollment choices by then, your coverage will default to the basic plan.\n\nPlease log into the Workday portal, review your coverage options, and submit your final confirmation."
  },
  {
    id: "msg-901",
    senderName: "Vercel Deployment",
    senderEmail: "deployments@vercel.com",
    subject: "Production deploy succeeded for project: aura-core",
    date: "July 7, 2026 8:30 PM",
    snippet: "Project: aura-core. Branch: main. Commit: Pushed update to Realtime Sync client. Status: Active...",
    body: "Project: aura-core\nBranch: main\nCommit: Pushed update to Realtime Sync client\nDeploy URL: https://aura-core-v84.vercel.app\nStatus: Production Deployment Successful."
  }
];

function getMessageBody(payload: any): string {
  if (!payload) return "";
  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  if (payload.parts) {
    // Look for text/plain first
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body && part.body.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
    // Fallback to recursively looking for any text body
    for (const part of payload.parts) {
      const body = getMessageBody(part);
      if (body) return body;
    }
  }
  return "";
}

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

export async function GET(req: NextRequest) {
  try {
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
      // Sandbox fallback: return high-fidelity mock data
      return NextResponse.json({ messages: mockEmails, mode: "sandbox" });
    }

    // 3. Handle Production API Flow
    let accessToken = settings.access_token;
    const refreshToken = settings.refresh_token;
    const expiryDate = settings.expiry_date;

    // Refresh token if expired or near expiration (within 30 seconds)
    if (refreshToken && expiryDate && Date.now() > (expiryDate - 30 * 1000)) {
      try {
        console.log(`[Gmail Messages] Token expired for user ${user.id}. Refreshing...`);
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
        console.error("[Gmail Messages] Failed to refresh Google credentials:", refreshErr);
        return NextResponse.json({ error: "Google connection expired. Please reconnect Gmail." }, { status: 403 });
      }
    }

    // 4. Query Gmail Messages API
    console.log(`[Gmail Messages] Querying Gmail API for user: ${user.id}`);
    const gmailListResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5", {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    if (!gmailListResponse.ok) {
      const errorText = await gmailListResponse.text();
      console.error("[Gmail Messages] Gmail list endpoint failed:", errorText);
      let detail = "Failed to fetch messages from Gmail API";
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          detail = errorJson.error.message;
        }
      } catch (_) {}
      return NextResponse.json({ error: detail }, { status: gmailListResponse.status });
    }

    const gmailListData = await gmailListResponse.json();
    const list = gmailListData.messages || [];

    if (list.length === 0) {
      return NextResponse.json({ messages: [], mode: "production" });
    }

    // 5. Query full message details in parallel
    const detailPromises = list.map(async (msgItem: any) => {
      try {
        const msgDetailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgItem.id}`, {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });

        if (!msgDetailResponse.ok) return null;
        
        const detail = await msgDetailResponse.json();
        
        // Extract headers
        const headers = detail.payload?.headers || [];
        const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
        
        const fromHeader = getHeader("From"); // format: "Name <email@site.com>" or just "email@site.com"
        let senderName = fromHeader;
        let senderEmail = fromHeader;

        if (fromHeader.includes("<")) {
          const match = fromHeader.match(/^(.*?)\s*<(.*?)>$/);
          if (match) {
            senderName = match[1].replace(/['"]/g, "").trim() || match[2];
            senderEmail = match[2].trim();
          }
        }

        const dateHeader = getHeader("Date");
        const subject = getHeader("Subject") || "(No Subject)";
        const snippet = detail.snippet || "";
        const body = getMessageBody(detail.payload) || snippet || "(Empty Email)";

        return {
          id: detail.id,
          senderName,
          senderEmail,
          subject,
          date: dateHeader,
          snippet,
          body
        };
      } catch (err) {
        console.error(`[Gmail Messages] Failed to fetch message detail ${msgItem.id}:`, err);
        return null;
      }
    });

    const parsedMessages = (await Promise.all(detailPromises)).filter(m => m !== null);

    return NextResponse.json({ messages: parsedMessages, mode: "production" });

  } catch (error: any) {
    console.error("[Gmail Messages API Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
