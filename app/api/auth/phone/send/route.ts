import { NextRequest, NextResponse } from "next/server";
import { insforge } from "../../../../../lib/insforge";
import { sendOtpMessage } from "../../../../../lib/sentdm";

const isMock = !process.env.SENT_DM_API_KEY || process.env.SENT_DM_API_KEY === 'mock_key_sentdm';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log(`[Auth Log] POST /api/auth/phone/send - Request received at ${new Date().toISOString()}`);

  try {
    const body = await req.json();
    const { phoneNumber, method } = body;

    const maskedPhone = phoneNumber && typeof phoneNumber === 'string'
      ? phoneNumber.replace(/(\+\d{2})\d+(\d{4})/, '$1****$2')
      : 'invalid';

    console.log(`[Auth Log] Sending OTP request for phone: ${maskedPhone}, channel: ${method}`);

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      console.warn(`[Auth Log] Rejecting request: Phone number is required`);
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    if (!phoneNumber.startsWith('+')) {
      console.warn(`[Auth Log] Rejecting request: Phone number missing '+' prefix`);
      return NextResponse.json({ error: "Phone number must include country code (e.g. +1...)" }, { status: 400 });
    }

    if (method !== 'sms' && method !== 'whatsapp') {
      console.warn(`[Auth Log] Rejecting request: Invalid method ${method}`);
      return NextResponse.json({ error: "Invalid verification method. Choose SMS or WhatsApp." }, { status: 400 });
    }

    // Generate random 6-digit code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Delete previous OTPs for this phone number to avoid pollution
    console.log(`[Auth Log] Cleaning up existing OTP records for ${maskedPhone}`);
    const { error: deleteError } = await insforge.database
      .from('phone_otps')
      .delete()
      .eq('phone_number', phoneNumber);

    if (deleteError) {
      console.warn(`[Auth Log] Non-fatal DB cleanup warning:`, deleteError);
    }

    // 2. Insert the new OTP
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    console.log(`[Auth Log] Inserting new OTP record into DB (expires at ${expiresAt.toISOString()})`);
    const { error: insertError } = await insforge.database
      .from('phone_otps')
      .insert([{
        phone_number: phoneNumber,
        otp_code: otpCode,
        method: method,
        expires_at: expiresAt.toISOString()
      }]);

    if (insertError) {
      console.error("[Auth Log] [OTP Send Error] DB insertion failed:", insertError);
      return NextResponse.json({ error: "Failed to initialize verification session" }, { status: 500 });
    }

    // 3. Dispatch the message via Sent.dm
    console.log(`[Auth Log] Dispatching message via Sent.dm (Sandbox: ${isMock})`);
    await sendOtpMessage(phoneNumber, otpCode, method);

    const duration = Date.now() - startTime;
    console.log(`[Auth Log] POST /api/auth/phone/send succeeded in ${duration}ms`);

    return NextResponse.json({
      success: true,
      sandbox: isMock,
      // Expose the OTP in mock environment for easy testing
      code: isMock ? otpCode : undefined
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[Auth Log] [OTP Send API Exception] Exception after ${duration}ms:`, error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}

