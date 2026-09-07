import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendOtpEmail(to: string, otp: string, purpose: 'verify' | 'login' | 'reset') {
    const subject = purpose === 'verify'
        ? 'Verify your CampusMart account'
        : purpose === 'reset'
        ? 'Reset your CampusMart password'
        : 'Your CampusMart login OTP';

    const heading = purpose === 'verify'
        ? '✅ Verify your email address'
        : purpose === 'reset'
        ? '🔑 Reset your password'
        : '🔐 Your one-time login code';

    const message = purpose === 'verify'
        ? 'Please use the OTP below to verify your email and complete registration:'
        : purpose === 'reset'
        ? 'Use this OTP to verify it\'s you and set a new password:'
        : 'Use this OTP to complete your sign in:';

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4f8; margin: 0; padding: 40px 20px;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px 40px; text-align: center;">
          <div style="font-size: 28px; font-weight: 900; color: white; letter-spacing: 0.05em;">CAMPUS<span style="font-size:16px; display:block; letter-spacing:0.3em; font-weight:700; margin-top:-4px;">MART</span></div>
        </div>
        <!-- Body -->
        <div style="padding: 40px;">
          <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px;">${heading}</h2>
          <p style="color: #64748b; margin: 0 0 32px; font-size: 14px; line-height: 1.6;">${message}</p>
          <!-- OTP Block -->
          <div style="background: #f8faff; border: 2px solid #e0e8ff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <div style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #1e3a8a; font-variant-numeric: tabular-nums;">${otp}</div>
            <p style="margin: 8px 0 0; color: #94a3b8; font-size: 12px;">⏱ Expires in <strong>10 minutes</strong></p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            If you didn't request this, you can safely ignore this email.<br>
            Never share your OTP with anyone.
          </p>
        </div>
        <!-- Footer -->
        <div style="background: #f8faff; padding: 20px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">© 2025 CampusMart · Your Complete Guide to Campus Infrastructure</p>
        </div>
      </div>
    </body>
    </html>
    `;

    console.log(`\n==========================================`);
    console.log(`🔑 [CAMPUSMART OTP CODE]`);
    console.log(`   To:      ${to}`);
    console.log(`   OTP:     ${otp}`);
    console.log(`   Purpose: ${purpose}`);
    console.log(`==========================================\n`);

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'CampusMart <web.thirdeye@gmail.com>',
            to,
            subject,
            html,
        });
        console.log(`✅ OTP email successfully dispatched to ${to}`);
    } catch (smtpError: any) {
        console.error(`⚠️ SMTP Email Sending Failed: ${smtpError?.message || smtpError}`);
        console.error(`👉 [FAIL] OTP could not be delivered to ${to}.`);
        throw smtpError;
    }
}

export function generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
}
