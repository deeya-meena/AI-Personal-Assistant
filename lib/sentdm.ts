import SentDm from '@sentdm/sentdm';

// Check if we are running with a mock/empty API key
const isMock = !process.env.SENT_DM_API_KEY || process.env.SENT_DM_API_KEY === 'mock_key_sentdm';

// Initialize the Sent.dm client safely
export const sentdm = isMock ? null : new SentDm();

/**
 * Sends a One-Time Password (OTP) to the specified phone number via SMS or WhatsApp.
 * Uses the template ID: 6a729b2b-25c5-4172-8f43-1631ffbf7911
 */
export async function sendOtpMessage(phoneNumber: string, otpCode: string, method: 'sms' | 'whatsapp') {
  console.log(`[Sent.dm Info] Delivery request: Channel=${method.toUpperCase()}, To=${phoneNumber}, Code=${otpCode}`);

  if (isMock || !sentdm) {
    console.log(`[Sent.dm Sandbox Mode] Mock sending OTP: ${otpCode} to ${phoneNumber} via ${method}`);
    return { success: true, sandbox: true };
  }

  try {
    const response = await sentdm.messages.send({
      to: [phoneNumber],
      template: {
        id: '6a729b2b-25c5-4172-8f43-1631ffbf7911',
        name: 'otp',
        parameters: {
          code: otpCode,
          otp: otpCode
        }
      }
    });

    return {
      success: true,
      messageId: response?.data?.recipients?.[0]?.message_id || null,
    };
  } catch (error: any) {
    console.error('[Sent.dm Error] Service invocation failed:', error);
    throw new Error(error.message || 'Failed to send OTP message via Sent.dm');
  }
}
