import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-store";

export async function GET(req: NextRequest) {
  try {
    // Check Bearer token first
    const authHeader = req.headers.get("authorization") || "";
    let token = authHeader.replace("Bearer ", "").trim();

    // If not in header, check cookie
    if (!token) {
      token = req.cookies.get("auth_session")?.value || "";
    }

    if (!token) {
      return NextResponse.json(
        { error: { message: "No active session found.", code: "UNAUTHENTICATED" } },
        { status: 401 }
      );
    }

    const sessionData = getSession(token);
    if (!sessionData) {
      return NextResponse.json(
        { error: { message: "Session expired or invalid.", code: "INVALID_SESSION" } },
        { status: 401 }
      );
    }

    const { user } = sessionData;
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      phone_number: user.phone_number,
      auth_provider: user.auth_provider,
      email_verified: user.email_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
    };

    return NextResponse.json({
      user: safeUser,
    });
  } catch (err: any) {
    console.error("[Auth API] Session Error:", err);
    return NextResponse.json(
      { error: { message: err.message || "Failed to retrieve session.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
