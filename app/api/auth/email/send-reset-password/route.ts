import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createPasswordReset } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: { message: "Please provide a valid email address.", code: "INVALID_EMAIL" } },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);
    if (!user) {
      // Return 404 with helpful message
      return NextResponse.json(
        { error: { message: "No account found with this email address.", code: "USER_NOT_FOUND" } },
        { status: 404 }
      );
    }

    const reset = createPasswordReset(user.email);

    return NextResponse.json({
      data: {
        success: true,
        message: "Password reset instructions have been issued.",
        // We include the 6-digit OTP code in response so user can test the reset flow immediately without requiring an SMTP email server
        code: reset.code,
        token: reset.token,
      },
      error: null,
    });
  } catch (err: any) {
    console.error("[Auth API] Password Reset Request Error:", err);
    return NextResponse.json(
      { error: { message: err.message || "Failed to process reset request.", code: "SERVER_ERROR" } },
      { status: 500 }
    );
  }
}
