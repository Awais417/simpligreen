import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const LOGO_URL    = 'https://simpligreen.netlify.app/logo.jpeg';
const BRAND_GREEN = '#4caf50';
const BRAND_DARK  = '#2e2e2e';

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  resetToken: string,
): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';
  const resetLink   = `${frontendUrl}/reset-password?token=${resetToken}`;
  const year        = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f0;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#f0f4f0;padding:40px 16px;">
    <tr><td align="center">

      <!-- Card -->
      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;width:100%;background:#ffffff;
                    border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.09);">

        <!-- ── HEADER ── -->
        <tr>
          <td style="background:${BRAND_DARK};padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="6" style="background:${BRAND_GREEN};font-size:0;">&nbsp;</td>
                <td style="padding:26px 36px;">
                  <img src="${LOGO_URL}" alt="SimpliGreen Energy Solutions"
                       width="210" height="auto"
                       style="display:block;max-width:210px;height:auto;"/>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── HERO BANNER ── -->
        <tr>
          <td style="background:linear-gradient(135deg,#1b5e20 0%,#43a047 60%,#66bb6a 100%);
                     padding:40px 40px 36px;text-align:center;">
            <table cellpadding="0" cellspacing="0" border="0" align="center"
                   style="margin:0 auto 18px;">
              <tr>
                <td align="center" width="68" height="68"
                    style="background:rgba(255,255,255,0.18);border-radius:50%;
                           width:68px;height:68px;font-size:30px;
                           line-height:68px;text-align:center;">
                  &#128272;
                </td>
              </tr>
            </table>
            <h1 style="margin:0 0 10px;color:#ffffff;font-size:28px;
                        font-weight:800;letter-spacing:-0.5px;">
              Password Reset
            </h1>
            <p style="margin:0;color:rgba(255,255,255,0.88);font-size:15px;line-height:1.5;">
              We received a request to reset your account password
            </p>
          </td>
        </tr>

        <!-- ── BODY ── -->
        <tr>
          <td style="padding:40px 40px 32px;">

            <p style="margin:0 0 18px;font-size:16px;color:${BRAND_DARK};line-height:1.6;">
              Hi <strong>${userName}</strong>,
            </p>
            <p style="margin:0 0 30px;font-size:15px;color:#555555;line-height:1.75;">
              Your <strong style="color:${BRAND_DARK};">SimpliGreen CRM</strong> password reset
              has been requested. Click the button below to choose a new password.
              This link is valid for <strong>1 hour</strong> and can only be used once.
            </p>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 36px;">
              <tr>
                <td align="center">
                  <a href="${resetLink}"
                     style="display:inline-block;
                            background:linear-gradient(135deg,#2e7d32 0%,#4caf50 100%);
                            color:#ffffff;text-decoration:none;
                            padding:17px 52px;border-radius:8px;
                            font-size:17px;font-weight:700;letter-spacing:0.3px;
                            box-shadow:0 6px 18px rgba(76,175,80,0.45);">
                    &#128274;&nbsp; Reset My Password
                  </a>
                </td>
              </tr>
            </table>

            <!-- Info pills -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px;">
              <tr>
                <td width="31%" valign="top"
                    style="background:#f4fbf4;border:1px solid #c8e6c9;
                           border-radius:10px;padding:18px 14px;text-align:center;">
                  <div style="font-size:24px;margin-bottom:8px;">&#9201;</div>
                  <p style="margin:0;font-size:12px;font-weight:700;
                             color:${BRAND_DARK};text-transform:uppercase;letter-spacing:0.4px;">
                    Expires In
                  </p>
                  <p style="margin:5px 0 0;font-size:14px;color:#2e7d32;font-weight:700;">
                    1 Hour
                  </p>
                </td>
                <td width="3%"></td>
                <td width="31%" valign="top"
                    style="background:#f4fbf4;border:1px solid #c8e6c9;
                           border-radius:10px;padding:18px 14px;text-align:center;">
                  <div style="font-size:24px;margin-bottom:8px;">&#128737;</div>
                  <p style="margin:0;font-size:12px;font-weight:700;
                             color:${BRAND_DARK};text-transform:uppercase;letter-spacing:0.4px;">
                    Single Use
                  </p>
                  <p style="margin:5px 0 0;font-size:14px;color:#2e7d32;font-weight:700;">
                    One-time link
                  </p>
                </td>
                <td width="3%"></td>
                <td width="31%" valign="top"
                    style="background:#f4fbf4;border:1px solid #c8e6c9;
                           border-radius:10px;padding:18px 14px;text-align:center;">
                  <div style="font-size:24px;margin-bottom:8px;">&#128272;</div>
                  <p style="margin:0;font-size:12px;font-weight:700;
                             color:${BRAND_DARK};text-transform:uppercase;letter-spacing:0.4px;">
                    Secure
                  </p>
                  <p style="margin:5px 0 0;font-size:14px;color:#2e7d32;font-weight:700;">
                    SHA-256 token
                  </p>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
              <tr><td style="border-top:1px solid #eeeeee;font-size:0;">&nbsp;</td></tr>
            </table>

            <!-- Fallback URL box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:#f8f9fa;border:1px solid #e9ecef;
                          border-radius:8px;margin:0 0 24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:11px;font-weight:700;
                             color:#999999;text-transform:uppercase;letter-spacing:0.6px;">
                    Button not working? Copy this link:
                  </p>
                  <a href="${resetLink}"
                     style="color:${BRAND_GREEN};font-size:12px;
                            word-break:break-all;text-decoration:none;line-height:1.5;">
                    ${resetLink}
                  </a>
                </td>
              </tr>
            </table>

            <!-- Warning -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#fffde7;border-left:4px solid #f9a825;
                           border-radius:0 8px 8px 0;padding:14px 18px;">
                  <p style="margin:0;font-size:13px;color:#795548;line-height:1.6;">
                    <strong>&#9888; Didn't request this?</strong><br/>
                    Your account is safe and no changes were made.
                    Simply ignore this email.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background:#263238;padding:28px 40px;text-align:center;">
            <img src="${LOGO_URL}" alt="SimpliGreen" width="140" height="auto"
                 style="display:block;margin:0 auto 14px;max-width:140px;
                        opacity:0.85;filter:brightness(1.4);"/>
            <p style="margin:0 0 6px;font-size:12px;color:#90a4ae;line-height:1.5;">
              © ${year} SimpliGreen Energy Solutions. All rights reserved.
            </p>
            <p style="margin:0;font-size:11px;color:#607d8b;">
              This is an automated security email — please do not reply.
            </p>
          </td>
        </tr>

      </table>
      <!-- /Card -->

    </td></tr>
  </table>

</body>
</html>`;

  await transporter.sendMail({
    from: `"SimpliGreen Energy Solutions" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: '🔐 Reset your SimpliGreen CRM password',
    html,
  });
}
