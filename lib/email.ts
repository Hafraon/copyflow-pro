import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@copyflow.com',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendTeamInvite(email: string, teamName: string, inviteToken: string) {
  const inviteUrl = `${process.env.NEXTAUTH_URL}/team/invite/${inviteToken}`;
  
  const subject = `You've been invited to join ${teamName} on CopyFlow`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Team Invitation</h2>
      <p>You've been invited to join the team "${teamName}" on CopyFlow.</p>
      <p>Click the button below to accept the invitation:</p>
      <a href="${inviteUrl}" style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Accept Invitation
      </a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${inviteUrl}">${inviteUrl}</a></p>
      <p>This invitation will expire in 7 days.</p>
    </div>
  `;

  await sendEmail(email, subject, html);
}