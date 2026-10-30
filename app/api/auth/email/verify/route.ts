import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, updateUser } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email) {
      return NextResponse.json({ error: { message: "Email is required." } }, { status: 400 });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: { message: "User not found." } }, { status: 404 });
    }

    // Mark email as verified
    const updated = updateUser(user.id, { email_verified: true });

    return NextResponse.json({
      data: {
        user: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          emailVerified: true,
        },
      },
      error: null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
