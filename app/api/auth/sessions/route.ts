import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, createSession, updateUser } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: { message: "Email and password are required.", code: "INVALID_CREDENTIALS" } },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: { message: "Invalid email or password.", code: "INVALID_CREDENTIALS" } },
        { status: 401 }
      );
    }

    // Check if account was created using Google
    if (user.auth_provider === "google" && !user.password_hash) {
      return NextResponse.json(
        {
          error: {
            message: "This account was registered using Google Sign-In. Please sign in with Google.",
            code: "USE_GOOGLE_SIGNIN",
          },
        },
        { status: 400 }
      );
    }

    // Verify password
    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: { message: "Invalid email or password.", code: "INVALID_CREDENTIALS" } },
        { status: 401 }
      );
    }

    // Update last login
    updateUser(user.id, { last_login_at: new Date().toISOString() });

    // Create session
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

    // Set secure HTTP-only cookie
    response.cookies.set("auth_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error("[Auth API] Sign In Error:", err);
    return NextResponse.json(
      { error: { message: err.message || "Authentication failed.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
