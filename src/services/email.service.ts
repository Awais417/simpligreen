import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  resetToken: string,
): Promise<void> {
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"SimpliGreen CRM" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: 'Password Reset Request – SimpliGreen CRM',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f4f7f6;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:#1a7a4a;padding:32px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:0.5px;">
                        SimpliGreen CRM
                      </h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 24px;">
                      <p style="margin:0 0 16px;font-size:16px;color:#333333;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      <p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.6;">
                        We received a request to reset the password for your SimpliGreen CRM account.
                        Click the button below to choose a new password.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetLink}"
                              style="display:inline-block;background:#1a7a4a;color:#ffffff;
                                     text-decoration:none;padding:14px 36px;border-radius:6px;
                                     font-size:16px;font-weight:bold;letter-spacing:0.3px;">
                              Reset My Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 8px;font-size:14px;color:#888888;">
                        This link expires in <strong>1 hour</strong>.
                        If you did not request a password reset, you can safely ignore this email.
                      </p>
                      <p style="margin:16px 0 0;font-size:13px;color:#aaaaaa;word-break:break-all;">
                        Or copy this link into your browser:<br/>
                        <a href="${resetLink}" style="color:#1a7a4a;">${resetLink}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eeeeee;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#aaaaaa;">
                        © ${new Date().getFullYear()} SimpliGreen CRM. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}
