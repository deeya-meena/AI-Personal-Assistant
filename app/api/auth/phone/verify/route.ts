import { NextRequest, NextResponse } from "next/server";
import { insforge } from "../../../../../lib/insforge";
import crypto from "crypto";

const getPhoneAuthSecret = () => process.env.PHONE_AUTH_SECRET || "phone-auth-secure-secret-key-aura-ai-2026";

const getPasswordForPhone = (phone: string) => {
  const secret = getPhoneAuthSecret();
  return crypto.createHmac("sha256", secret).update(phone).digest("hex");
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log(`[Auth Log] POST /api/auth/phone/verify - Request received at ${new Date().toISOString()}`);

  try {
    const body = await req.json();
    const { phoneNumber, otpCode, method } = body;

    const maskedPhone = phoneNumber && typeof phoneNumber === 'string'
      ? phoneNumber.replace(/(\+\d{2})\d+(\d{4})/, '$1****$2')
      : 'invalid';

    console.log(`[Auth Log] Verifying OTP for phone: ${maskedPhone}, method: ${method}`);

    if (!phoneNumber || !otpCode || !method) {
      console.warn(`[Auth Log] Rejecting verify: Missing required fields`);
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify the OTP in the database
    console.log(`[Auth Log] Checking OTP match in DB for ${maskedPhone}`);
    const { data: otps, error: selectError } = await insforge.database
      .from('phone_otps')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('otp_code', otpCode)
      .gt('expires_at', new Date().toISOString());

    if (selectError) {
      console.error("[Auth Log] [OTP Verify Error] Select failed:", selectError);
      return NextResponse.json({ error: "Database verification failed" }, { status: 500 });
    }

    if (!otps || otps.length === 0) {
      console.warn(`[Auth Log] OTP verification failed: Invalid or expired code for ${maskedPhone}`);
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    console.log(`[Auth Log] Valid OTP code verified successfully for ${maskedPhone}`);

    // 2. Consume the OTP immediately by deleting it
    console.log(`[Auth Log] Deleting consumed OTP record for ${maskedPhone}`);
    const { error: deleteError } = await insforge.database
      .from('phone_otps')
      .delete()
      .eq('phone_number', phoneNumber);

    if (deleteError) {
      console.warn(`[Auth Log] Non-fatal OTP deletion warning:`, deleteError);
    }

    // 3. Generate phone login credentials
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    const email = `phone_${cleanPhone}@auth.aura.ai`;
    const password = getPasswordForPhone(cleanPhone);
    const authSecret = getPhoneAuthSecret();

    // 4. Register/Update the user and their public profile inside a transaction via RPC
    console.log(`[Auth Log] Invoking RPC create_phone_user for user ${email}`);
    const { data: userId, error: rpcError } = await insforge.database.rpc('create_phone_user', {
      p_email: email,
      p_password: password,
      p_phone_number: phoneNumber,
      p_verification_method: method,
      p_secret_token: authSecret
    });

    if (rpcError) {
      console.error("[Auth Log] [OTP Verify Error] RPC failed:", rpcError);
      return NextResponse.json({ error: "Failed to create or update authenticated user" }, { status: 500 });
    }

    const duration = Date.now() - startTime;
    console.log(`[Auth Log] POST /api/auth/phone/verify succeeded in ${duration}ms for user ${userId}`);

    // 5. Return success and derived login credentials so client can complete signInWithPassword
    return NextResponse.json({
      success: true,
      email,
      password,
      userId
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[Auth Log] [OTP Verify API Exception] Exception after ${duration}ms:`, error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}

