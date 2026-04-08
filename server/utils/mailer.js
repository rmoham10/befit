const FormData = require('form-data');
const Mailgun  = require('mailgun.js');

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  // If your domain is on the EU region, uncomment the line below:
  // url: 'https://api.eu.mailgun.net',
});

const DOMAIN   = process.env.MAILGUN_DOMAIN;
const FROM     = process.env.MAILGUN_FROM || `QuickSign <noreply@${DOMAIN}>`;
const CLIENT   = process.env.CLIENT_URL;

/**
 * Send an email-verification link to a new user.
 * @param {string} toEmail   - recipient email address
 * @param {string} toName    - recipient full name
 * @param {string} token     - the raw UUID token stored in email_verifications
 */
async function sendVerificationEmail(toEmail, toName, token) {
  const link = `${CLIENT}/verify-email?token=${token}`;

  await mg.messages.create(DOMAIN, {
    from: FROM,
    to:   `${toName} <${toEmail}>`,
    subject: 'Verify your QuickSign email address',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Verify your email – QuickSign</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f5f3;font-family:system-ui,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="max-width:520px;background:#ffffff;border-radius:16px;
                            padding:40px 36px;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
                <tr>
                  <td>
                    <!-- Logo -->
                    <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#1a1a1a;">QuickSign</p>

                    <!-- Heading -->
                    <p style="margin:0 0 12px;font-size:20px;font-weight:600;color:#1a1a1a;">
                      Verify your email address
                    </p>
                    <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.6;">
                      Hi ${toName}, thanks for signing up! Click the button below to confirm your
                      email address. This link expires in <strong>24 hours</strong>.
                    </p>

                    <!-- CTA button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                      <tr>
                        <td align="center">
                          <a href="${link}"
                             style="display:inline-block;padding:13px 32px;background:#534AB7;
                                    color:#ffffff;text-decoration:none;border-radius:8px;
                                    font-size:15px;font-weight:600;">
                            Verify Email
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Fallback link -->
                    <p style="margin:0 0 6px;font-size:12px;color:#aaa;">
                      If the button doesn't work, copy and paste this URL into your browser:
                    </p>
                    <p style="margin:0 0 28px;font-size:12px;color:#534AB7;word-break:break-all;">
                      ${link}
                    </p>

                    <!-- Footer -->
                    <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 20px;"/>
                    <p style="margin:0;font-size:12px;color:#bbb;text-align:center;">
                      If you didn't create a QUickSign account, you can safely ignore this email.
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
    text: `Hi ${toName},\n\nVerify your QuickSign email by visiting:\n${link}\n\nThis link expires in 24 hours.\n\nIf you didn't sign up, ignore this email.`,
  });
}

module.exports = { sendVerificationEmail };
