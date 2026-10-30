import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail, createSession } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, confirmPassword } = body;

    // Validate email
    if (!email || typeof email !== "string" || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: { message: "Please provide a valid email address.", code: "INVALID_EMAIL" } },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: { message: "Password must be at least 6 characters long.", code: "WEAK_PASSWORD" } },
        { status: 400 }
      );
    }

    // Validate confirmation password if provided
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { error: { message: "Passwords do not match.", code: "PASSWORD_MISMATCH" } },
        { status: 400 }
      );
    }

    // Check duplicate email
    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: { message: "An account with this email already exists. Please sign in instead.", code: "USER_ALREADY_EXISTS" } },
        { status: 409 }
      );
    }

    // Create user
    const user = createUser({
      email,
      password,
      name,
      auth_provider: "email",
      email_verified: true,
    });

    // Create session
    const session = createSession(user.id);

    // Sanitize user output
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
      requireEmailVerification: false,
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
    console.error("[Auth API] Sign Up Error:", err);
    return NextResponse.json(
      { error: { message: err.message || "Failed to create account.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
