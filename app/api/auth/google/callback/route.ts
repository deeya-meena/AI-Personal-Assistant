import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser, updateUser, createSession } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, redirectUri } = body;

    if (!code) {
      return NextResponse.json(
        { error: { message: "Authorization code is required.", code: "MISSING_CODE" } },
        { status: 400 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          error: {
            message: "Google OAuth credentials (Client ID or Client Secret) are not configured on the server.",
            code: "GOOGLE_NOT_CONFIGURED",
          },
        },
        { status: 500 }
      );
    }

    const effectiveRedirectUri = redirectUri || `${req.nextUrl.origin}/auth/callback`;

    // 1. Exchange authorization code for Google access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: effectiveRedirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      console.error("[Google OAuth Callback Error] Token Exchange failed:", tokenData);
      const detail = tokenData.error_description || tokenData.error || "Token exchange failed";
      let friendlyMsg = `Google authentication failed: ${detail}`;
      if (tokenData.error === "redirect_uri_mismatch") {
        friendlyMsg = `Redirect URI mismatch (${effectiveRedirectUri}). Please ensure this URL is added under 'Authorized redirect URIs' in Google Cloud Console.`;
      }
      return NextResponse.json(
        { error: { message: friendlyMsg, code: tokenData.error || "OAUTH_EXCHANGE_FAILED" } },
        { status: 400 }
      );
    }

    // 2. Fetch user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileRes.ok) {
      return NextResponse.json(
        { error: { message: "Failed to retrieve Google user profile.", code: "PROFILE_FETCH_FAILED" } },
        { status: 400 }
      );
    }

    const googleUser = await profileRes.json();
    const email = googleUser.email?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: { message: "No email address was returned by Google.", code: "NO_EMAIL" } },
        { status: 400 }
      );
    }

    // 3. Find or create user
    let user = findUserByEmail(email);
    if (!user) {
      user = createUser({
        email,
        name: googleUser.name || email.split("@")[0],
        avatar_url: googleUser.picture || null,
        auth_provider: "google",
        email_verified: googleUser.email_verified ?? true,
      });
    } else {
      user = updateUser(user.id, {
        name: user.name || googleUser.name,
        avatar_url: user.avatar_url || googleUser.picture || null,
        last_login_at: new Date().toISOString(),
      });
    }

    // 4. Create session
    const session = createSession(user.id);

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      auth_provider: user.auth_provider,
      email_verified: user.email_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    const response = NextResponse.json({
      user: safeUser,
      accessToken: session.token,
    });

    response.cookies.set("auth_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error("[Google OAuth Callback Exception]:", err);
    return NextResponse.json(
      { error: { message: err.message || "An unexpected error occurred during Google sign in.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
