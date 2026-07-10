import { NextRequest, NextResponse } from "next/server";
import { insforge } from "../../../../../lib/insforge";
import crypto from "crypto";

const getPasswordForPhone = (phone: string) => {
  const secret = process.env.PHONE_AUTH_SECRET || "phone-auth-secure-secret-key-aura-ai-2026";
  return crypto.createHmac("sha256", secret).update(phone).digest("hex");
};

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otpCode, method } = await req.json();

    if (!phoneNumber || !otpCode || !method) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify the OTP in the database
    const { data: otps, error: selectError } = await insforge.database
      .from('phone_otps')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('otp_code', otpCode)
      .gt('expires_at', new Date().toISOString());

    if (selectError) {
      console.error("[OTP Verify Error] Select failed:", selectError);
      return NextResponse.json({ error: "Database verification failed" }, { status: 500 });
    }

    if (!otps || otps.length === 0) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // 2. Consume the OTP immediately by deleting it
    await insforge.database
      .from('phone_otps')
      .delete()
      .eq('phone_number', phoneNumber);

    // 3. Generate phone login credentials
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const email = `phone_${cleanPhone}@auth.aura.ai`;
    const password = getPasswordForPhone(cleanPhone);

    // 4. Register/Update the user and their public profile inside a transaction via RPC
    const { data: userId, error: rpcError } = await insforge.database.rpc('create_phone_user', {
      p_email: email,
      p_password: password,
      p_phone_number: phoneNumber,
      p_verification_method: method,
      p_secret_token: 'phone-auth-secure-secret-key-aura-ai-2026'
    });

    if (rpcError) {
      console.error("[OTP Verify Error] RPC failed:", rpcError);
      return NextResponse.json({ error: "Failed to create or update authenticated user" }, { status: 500 });
    }

    // 5. Return success and derived login credentials so client can complete signInWithPassword
    return NextResponse.json({
      success: true,
      email,
      password,
      userId
    });

  } catch (error: any) {
    console.error("[OTP Verify API Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
