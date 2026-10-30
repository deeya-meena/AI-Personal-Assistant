import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const redirectUri = searchParams.get("redirect_uri") || `${req.nextUrl.origin}/auth/callback`;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.startsWith("your-") || clientId.includes("placeholder")) {
      return NextResponse.json(
        {
          error: {
            message: "Google OAuth is not configured. Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID in environment variables.",
            code: "GOOGLE_NOT_CONFIGURED",
          },
        },
        { status: 503 }
      );
    }

    const state = searchParams.get("state") || Math.random().toString(36).substring(2);

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "select_account");
    googleAuthUrl.searchParams.set("state", state);

    return NextResponse.json({
      authUrl: googleAuthUrl.toString(),
    });
  } catch (err: any) {
    console.error("[Auth API] Google OAuth Init Error:", err);
    return NextResponse.json(
      { error: { message: err.message || "Failed to initialize Google OAuth.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
