import { NextRequest, NextResponse } from "next/server";
import { completePasswordReset } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tokenOrCode = body.otp || body.token || body.code;
    const newPassword = body.newPassword || body.password;

    if (!tokenOrCode) {
      return NextResponse.json(
        { error: { message: "Reset code or token is required.", code: "MISSING_TOKEN" } },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: { message: "New password must be at least 6 characters long.", code: "WEAK_PASSWORD" } },
        { status: 400 }
      );
    }

    completePasswordReset(tokenOrCode, newPassword);

    return NextResponse.json({
      data: {
        success: true,
        message: "Your password has been successfully reset. You can now sign in with your new credentials.",
      },
      error: null,
    });
  } catch (err: any) {
    console.error("[Auth API] Password Reset Completion Error:", err);
    return NextResponse.json(
      { error: { message: err.message || "Failed to reset password.", code: "RESET_FAILED" } },
      { status: 400 }
    );
  }
}
