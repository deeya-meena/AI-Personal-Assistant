import { NextRequest, NextResponse } from "next/server";
import { insforge } from "../../../../../lib/insforge";
import { sendOtpMessage } from "../../../../../lib/sentdm";

const isMock = !process.env.SENT_DM_API_KEY || process.env.SENT_DM_API_KEY === 'mock_key_sentdm';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, method } = await req.json();

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    if (!phoneNumber.startsWith('+')) {
      return NextResponse.json({ error: "Phone number must include country code (e.g. +1...)" }, { status: 400 });
    }

    if (method !== 'sms' && method !== 'whatsapp') {
      return NextResponse.json({ error: "Invalid verification method. Choose SMS or WhatsApp." }, { status: 400 });
    }

    // Generate random 6-digit code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Delete previous OTPs for this phone number to avoid pollution
    await insforge.database
      .from('phone_otps')
      .delete()
      .eq('phone_number', phoneNumber);

    // 2. Insert the new OTP
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const { error: insertError } = await insforge.database
      .from('phone_otps')
      .insert([{
        phone_number: phoneNumber,
        otp_code: otpCode,
        method: method,
        expires_at: expiresAt.toISOString()
      }]);

    if (insertError) {
      console.error("[OTP Send Error] DB insertion failed:", insertError);
      return NextResponse.json({ error: "Failed to initialize verification session" }, { status: 500 });
    }

    // 3. Dispatch the message via Sent.dm
    await sendOtpMessage(phoneNumber, otpCode, method);

    return NextResponse.json({
      success: true,
      sandbox: isMock,
      // Expose the OTP in mock environment for easy testing
      code: isMock ? otpCode : undefined
    });

  } catch (error: any) {
    console.error("[OTP Send API Exception]:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
