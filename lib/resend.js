import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email, otp) {
  try {
    const data = await resend.emails.send({
      from: 'Job Tracker <onboarding@resend.dev>',
      to: [email],
      subject: 'Your OTP for Job Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verify Your Email</h2>
          <p>Your OTP code is:</p>
          <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
}

export async function sendReminderEmail(email, reminder, job) {
  try {
    const data = await resend.emails.send({
      from: 'Job Tracker <onboarding@resend.dev>',
      to: [email],
      subject: `Reminder: ${reminder.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🔔 Job Application Reminder</h2>
          <h3>${reminder.title}</h3>
          <p>${reminder.description}</p>
          ${job ? `
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Company:</strong> ${job.company}</p>
              <p><strong>Role:</strong> ${job.role}</p>
            </div>
          ` : ''}
          <p style="color: #6b7280; font-size: 14px;">
            Scheduled for: ${new Date(reminder.dateTime).toLocaleString()}
          </p>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
}

export default resend;
