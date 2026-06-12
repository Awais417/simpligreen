import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER || 'smtp.office365.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false, // STARTTLS
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: { ciphers: 'SSLv3' },
});

const LOGO_URL    = 'https://simpligreen.s3.eu-north-1.amazonaws.com/brand/logo.jpeg';
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
    from: `"SimpliGreen Energy Solutions" <${process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME}>`,
    to: toEmail,
    subject: '🔐 Reset your SimpliGreen CRM password',
    html,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared email builder
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationEmailOptions {
  toEmail: string;
  subject: string;
  heroIcon: string;
  heroBg: string;
  heroTitle: string;
  heroSubtitle: string;
  recipientName: string;
  bodyHtml: string;
}

async function sendNotificationEmail(opts: NotificationEmailOptions): Promise<void> {
  const year = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${opts.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f0;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#f0f4f0;padding:40px 16px;">
    <tr><td align="center">

      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;width:100%;background:#ffffff;
                    border-radius:12px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.09);">

        <!-- HEADER -->
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

        <!-- HERO -->
        <tr>
          <td style="background:${opts.heroBg};padding:36px 40px 32px;text-align:center;">
            <table cellpadding="0" cellspacing="0" border="0" align="center"
                   style="margin:0 auto 16px;">
              <tr>
                <td align="center" width="68" height="68"
                    style="background:rgba(255,255,255,0.18);border-radius:50%;
                           width:68px;height:68px;font-size:30px;
                           line-height:68px;text-align:center;">
                  ${opts.heroIcon}
                </td>
              </tr>
            </table>
            <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;
                        font-weight:800;letter-spacing:-0.5px;">
              ${opts.heroTitle}
            </h1>
            <p style="margin:0;color:rgba(255,255,255,0.88);font-size:14px;line-height:1.5;">
              ${opts.heroSubtitle}
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:36px 40px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:${BRAND_DARK};line-height:1.6;">
              Hi <strong>${opts.recipientName}</strong>,
            </p>
            ${opts.bodyHtml}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#263238;padding:28px 40px;text-align:center;">
            <img src="${LOGO_URL}" alt="SimpliGreen" width="140" height="auto"
                 style="display:block;margin:0 auto 14px;max-width:140px;
                        opacity:0.85;filter:brightness(1.4);"/>
            <p style="margin:0 0 6px;font-size:12px;color:#90a4ae;line-height:1.5;">
              © ${year} SimpliGreen Energy Solutions. All rights reserved.
            </p>
            <p style="margin:0;font-size:11px;color:#607d8b;">
              This is an automated notification — please do not reply.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;

  await transporter.sendMail({
    from: `"SimpliGreen Energy Solutions" <${process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME}>`,
    to: opts.toEmail,
    subject: opts.subject,
    html,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: info row
// ─────────────────────────────────────────────────────────────────────────────
function infoRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="38%" style="font-size:12px;font-weight:700;color:#999;
                                  text-transform:uppercase;letter-spacing:0.4px;">
            ${label}
          </td>
          <td style="font-size:14px;color:${BRAND_DARK};font-weight:600;">
            ${value}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function infoTable(rows: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:#f8fdf8;border:1px solid #c8e6c9;
                border-radius:10px;padding:4px 20px;margin:0 0 24px;">
    ${rows}
  </table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Job assigned to manager / QA
// ─────────────────────────────────────────────────────────────────────────────
export async function sendJobAssignedEmail(
  toEmail: string,
  recipientName: string,
  role: string,
  jobTitle: string,
  jobAddress: string | null,
  assignedByName: string,
): Promise<void> {
  const roleLabel = role === 'qa' ? 'QA Reviewer' : 'Manager';
  await sendNotificationEmail({
    toEmail,
    subject: `📋 New Job Assigned: ${jobTitle}`,
    heroBg: 'linear-gradient(135deg,#1565c0 0%,#1976d2 60%,#42a5f5 100%)',
    heroIcon: '&#128203;',
    heroTitle: 'New Job Assigned',
    heroSubtitle: `You have been assigned as ${roleLabel} on a new job`,
    recipientName,
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.75;">
        A new job has been assigned to you by <strong>${assignedByName}</strong>.
        Please log in to your SimpliGreen CRM dashboard to review the details.
      </p>
      ${infoTable(
        infoRow('Job Title', jobTitle) +
        infoRow('Your Role', roleLabel) +
        infoRow('Assigned By', assignedByName) +
        (jobAddress ? infoRow('Address', jobAddress) : ''),
      )}
      <p style="margin:0;font-size:13px;color:#777;line-height:1.6;">
        Log in to your dashboard to view all job details, tasks, and team members.
      </p>`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Task assigned to installer
// ─────────────────────────────────────────────────────────────────────────────
export async function sendTaskAssignedEmail(
  toEmail: string,
  installerName: string,
  taskDescription: string,
  jobTitle: string,
  assignedByName: string,
  sequenceNumber: number,
): Promise<void> {
  await sendNotificationEmail({
    toEmail,
    subject: `🔧 New Task Assigned: ${jobTitle}`,
    heroBg: 'linear-gradient(135deg,#e65100 0%,#f57c00 60%,#ffb74d 100%)',
    heroIcon: '&#128295;',
    heroTitle: 'New Task Assigned',
    heroSubtitle: 'You have a new task waiting for you',
    recipientName: installerName,
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.75;">
        <strong>${assignedByName}</strong> has assigned you a task.
        Log in to your SimpliGreen CRM app to view full details and submit your work.
      </p>
      ${infoTable(
        infoRow('Job', jobTitle) +
        infoRow('Task #', String(sequenceNumber)) +
        infoRow('Description', taskDescription) +
        infoRow('Assigned By', assignedByName),
      )}
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#fff8e1;border-left:4px solid #f9a825;
                    border-radius:0 8px 8px 0;margin:0 0 8px;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#795548;line-height:1.6;">
              &#9432; Please complete and submit this task through the app once done.
            </p>
          </td>
        </tr>
      </table>`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Task approved — notify installer
// ─────────────────────────────────────────────────────────────────────────────
export async function sendTaskApprovedEmail(
  toEmail: string,
  installerName: string,
  taskDescription: string,
  jobTitle: string,
  approvedByName: string,
  comments?: string | null,
): Promise<void> {
  await sendNotificationEmail({
    toEmail,
    subject: `✅ Task Approved: ${jobTitle}`,
    heroBg: 'linear-gradient(135deg,#1b5e20 0%,#43a047 60%,#66bb6a 100%)',
    heroIcon: '&#9989;',
    heroTitle: 'Task Approved',
    heroSubtitle: 'Great work! Your task submission has been approved',
    recipientName: installerName,
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.75;">
        Your task submission has been reviewed and <strong style="color:#2e7d32;">approved</strong>
        by <strong>${approvedByName}</strong>.
      </p>
      ${infoTable(
        infoRow('Job', jobTitle) +
        infoRow('Task', taskDescription) +
        infoRow('Approved By', approvedByName) +
        (comments ? infoRow('Comments', comments) : ''),
      )}
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#f4fbf4;border-left:4px solid #4caf50;
                    border-radius:0 8px 8px 0;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#2e7d32;line-height:1.6;">
              &#127881; Well done! Keep up the great work.
            </p>
          </td>
        </tr>
      </table>`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Task rejected — notify installer
// ─────────────────────────────────────────────────────────────────────────────
export async function sendTaskRejectedEmail(
  toEmail: string,
  installerName: string,
  taskDescription: string,
  jobTitle: string,
  rejectedByName: string,
  comments: string,
): Promise<void> {
  await sendNotificationEmail({
    toEmail,
    subject: `❌ Task Needs Revision: ${jobTitle}`,
    heroBg: 'linear-gradient(135deg,#b71c1c 0%,#e53935 60%,#ef9a9a 100%)',
    heroIcon: '&#128736;',
    heroTitle: 'Task Needs Revision',
    heroSubtitle: 'Your task submission requires changes',
    recipientName: installerName,
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.75;">
        Your task submission has been reviewed by <strong>${rejectedByName}</strong>
        and requires revision. Please review the feedback below and resubmit.
      </p>
      ${infoTable(
        infoRow('Job', jobTitle) +
        infoRow('Task', taskDescription) +
        infoRow('Reviewed By', rejectedByName),
      )}
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#fff3e0;border:1px solid #ffcc80;
                    border-radius:10px;margin:0 0 20px;">
        <tr>
          <td style="padding:18px 20px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#e65100;
                       text-transform:uppercase;letter-spacing:0.4px;">
              &#128172; Feedback from Manager
            </p>
            <p style="margin:0;font-size:14px;color:#4e342e;line-height:1.7;">
              ${comments}
            </p>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#fce4ec;border-left:4px solid #e53935;
                    border-radius:0 8px 8px 0;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#c62828;line-height:1.6;">
              &#9888; Please address the feedback and resubmit your task as soon as possible.
            </p>
          </td>
        </tr>
      </table>`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Job submitted to QA — notify QA
// ─────────────────────────────────────────────────────────────────────────────
export async function sendJobSubmittedToQAEmail(
  toEmail: string,
  qaName: string,
  jobTitle: string,
  jobAddress: string | null,
  managerName: string,
): Promise<void> {
  await sendNotificationEmail({
    toEmail,
    subject: `🔍 Job Ready for QA Review: ${jobTitle}`,
    heroBg: 'linear-gradient(135deg,#4a148c 0%,#7b1fa2 60%,#ba68c8 100%)',
    heroIcon: '&#128269;',
    heroTitle: 'Job Ready for QA Review',
    heroSubtitle: 'A job has been submitted for your quality assessment',
    recipientName: qaName,
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.75;">
        <strong>${managerName}</strong> has completed all tasks and submitted the job
        for your quality review. Please log in to assess and make your decision.
      </p>
      ${infoTable(
        infoRow('Job Title', jobTitle) +
        (jobAddress ? infoRow('Address', jobAddress) : '') +
        infoRow('Submitted By', managerName) +
        infoRow('Status', 'Awaiting QA Review'),
      )}
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#f3e5f5;border-left:4px solid #7b1fa2;
                    border-radius:0 8px 8px 0;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#4a148c;line-height:1.6;">
              &#128269; Please complete your QA review promptly in the SimpliGreen CRM dashboard.
            </p>
          </td>
        </tr>
      </table>`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. QA approved job — notify manager
// ─────────────────────────────────────────────────────────────────────────────
export async function sendJobApprovedEmail(
  toEmail: string,
  managerName: string,
  jobTitle: string,
  qaName: string,
  comments?: string | null,
): Promise<void> {
  await sendNotificationEmail({
    toEmail,
    subject: `✅ Job Approved by QA: ${jobTitle}`,
    heroBg: 'linear-gradient(135deg,#1b5e20 0%,#43a047 60%,#66bb6a 100%)',
    heroIcon: '&#127941;',
    heroTitle: 'Job Approved by QA',
    heroSubtitle: 'Congratulations! Your job has passed quality assessment',
    recipientName: managerName,
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.75;">
        Your job has been reviewed and <strong style="color:#2e7d32;">approved</strong>
        by QA reviewer <strong>${qaName}</strong>. The job is now complete.
      </p>
      ${infoTable(
        infoRow('Job Title', jobTitle) +
        infoRow('QA Reviewer', qaName) +
        infoRow('Final Status', '&#9989; Approved & Completed') +
        (comments ? infoRow('QA Comments', comments) : ''),
      )}
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#f4fbf4;border-left:4px solid #4caf50;
                    border-radius:0 8px 8px 0;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#2e7d32;line-height:1.6;">
              &#127881; Excellent work! The job has been successfully completed and finalised.
            </p>
          </td>
        </tr>
      </table>`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. QA rejected job — notify manager
// ─────────────────────────────────────────────────────────────────────────────
export async function sendJobRejectedEmail(
  toEmail: string,
  managerName: string,
  jobTitle: string,
  qaName: string,
  comments: string,
): Promise<void> {
  await sendNotificationEmail({
    toEmail,
    subject: `❌ Job Rejected by QA: ${jobTitle}`,
    heroBg: 'linear-gradient(135deg,#b71c1c 0%,#e53935 60%,#ef9a9a 100%)',
    heroIcon: '&#128203;',
    heroTitle: 'Job Returned by QA',
    heroSubtitle: 'Your job requires further attention before approval',
    recipientName: managerName,
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.75;">
        Your job has been reviewed by QA reviewer <strong>${qaName}</strong>
        and has been <strong style="color:#c62828;">returned for revision</strong>.
        Please review the feedback and address the issues.
      </p>
      ${infoTable(
        infoRow('Job Title', jobTitle) +
        infoRow('QA Reviewer', qaName) +
        infoRow('Status', '&#10060; Returned for Revision'),
      )}
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#fff3e0;border:1px solid #ffcc80;
                    border-radius:10px;margin:0 0 20px;">
        <tr>
          <td style="padding:18px 20px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#e65100;
                       text-transform:uppercase;letter-spacing:0.4px;">
              &#128172; QA Feedback
            </p>
            <p style="margin:0;font-size:14px;color:#4e342e;line-height:1.7;">
              ${comments}
            </p>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#fce4ec;border-left:4px solid #e53935;
                    border-radius:0 8px 8px 0;">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#c62828;line-height:1.6;">
              &#9888; Please address the QA feedback and resubmit the job.
            </p>
          </td>
        </tr>
      </table>`,
  });
}
