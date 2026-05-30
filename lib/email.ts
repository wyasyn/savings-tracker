import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = process.env.EMAIL_FROM ?? "Savings Tracker <onboarding@resend.dev>"

/** Sends the 6-digit sign-in code. Falls back to logging in dev (no API key). */
export async function sendOtpEmail(email: string, otp: string) {
  if (!resend) {
    // Dev fallback so you can sign in without configuring Resend yet.
    console.info(`\n[savings-tracker] Sign-in code for ${email}: ${otp}\n`)
    return
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${otp} is your Savings Tracker code`,
    text: `Your Savings Tracker sign-in code is ${otp}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:420px;margin:0 auto;padding:32px 24px;color:#111">
        <h1 style="font-size:18px;margin:0 0 8px">Your sign-in code</h1>
        <p style="font-size:14px;color:#555;margin:0 0 24px">Enter this code to continue to Savings Tracker. It expires in 10 minutes.</p>
        <div style="font-size:34px;font-weight:700;letter-spacing:10px;background:#f5f5f5;border-radius:12px;padding:18px 0;text-align:center">${otp}</div>
        <p style="font-size:12px;color:#888;margin:24px 0 0">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  })

  // Resend reports failures in `error` rather than throwing. Surface it so a
  // bad sender/domain fails loudly instead of looking like a sent email.
  if (error) {
    throw new Error(`Failed to send sign-in code: ${error.message}`)
  }
}
