import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email, otp) {
  try {
    console.log('Attempting to send OTP email to:', email);
    console.log('OTP:', otp);
    console.log('Resend API Key configured:', !!process.env.RESEND_API_KEY);
    
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Always send to verified email but include original email in body
    const sendTo = process.env.RESEND_VERIFIED_EMAIL || 'gauravsapkal1997@gmail.com';
    const isTestMode = email !== sendTo;

    const result = await resend.emails.send({
      from: 'Job Tracker <onboarding@resend.dev>',
      to: [sendTo],
      subject: isTestMode 
        ? `OTP for ${email} - Job Tracker` 
        : 'Your OTP for Job Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          ${isTestMode ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">🧪 Test Mode</p>
              <p style="margin: 5px 0 0 0; color: #92400e;">
                OTP requested by: <strong>${email}</strong>
              </p>
            </div>
          ` : ''}
          
          <h2 style="color: #1f2937;">Verify Your Email</h2>
          
          ${isTestMode ? `
            <p style="color: #4b5563;">
              Someone registered with email <strong>${email}</strong>
            </p>
          ` : ''}
          
          <p style="color: #4b5563;">Your OTP code is:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; font-size: 36px; letter-spacing: 8px; margin: 0;">
              ${otp}
            </h1>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            This code will expire in 10 minutes.
          </p>
          
          ${isTestMode ? `
            <div style="background: #e0e7ff; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #3730a3; font-size: 14px;">
                <strong>Note:</strong> This email was sent to you because domain verification is pending. 
                In production, this will be sent to <strong>${email}</strong>
              </p>
            </div>
          ` : `
            <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
              If you didn't request this code, please ignore this email.
            </p>
          `}
        </div>
      `,
    });
    
    console.log('Resend API response:', JSON.stringify(result, null, 2));
    
    // Check if there's an error in the response
    if (result.error) {
      console.error('Resend API returned error:', result.error);
      throw new Error(result.error.message || 'Failed to send email');
    }
    
    if (!result.data || !result.data.id) {
      console.error('Resend API returned no data:', result);
      throw new Error('Email service returned invalid response');
    }
    
    console.log('✅ OTP email sent successfully to:', sendTo);
    if (isTestMode) {
      console.log('📧 Original recipient:', email);
    }
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      statusCode: error.statusCode,
    });
    throw error;
  }
}

export async function sendReminderEmail(email, reminder, job) {
  try {
    console.log('Attempting to send reminder email to:', email);
    
    // Always send to verified email but include original email in body
    const sendTo = process.env.RESEND_VERIFIED_EMAIL || 'gauravsapkal1997@gmail.com';
    const isTestMode = email !== sendTo;
    
    const result = await resend.emails.send({
      from: 'Job Tracker <onboarding@resend.dev>',
      to: [sendTo],
      subject: isTestMode 
        ? `Reminder for ${email} - ${reminder.title}` 
        : `Reminder: ${reminder.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          ${isTestMode ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">🧪 Test Mode</p>
              <p style="margin: 5px 0 0 0; color: #92400e;">
                Reminder for user: <strong>${email}</strong>
              </p>
            </div>
          ` : ''}
          
          <h2 style="color: #1f2937;">🔔 Job Application Reminder</h2>
          <h3 style="color: #4F46E5;">${reminder.title}</h3>
          <p style="color: #4b5563;">${reminder.description}</p>
          
          ${job ? `
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Company:</strong> ${job.company}</p>
              <p style="margin: 5px 0;"><strong>Role:</strong> ${job.role}</p>
            </div>
          ` : ''}
          
          <p style="color: #6b7280; font-size: 14px;">
            Scheduled for: ${new Date(reminder.dateTime).toLocaleString()}
          </p>
          
          ${isTestMode ? `
            <div style="background: #e0e7ff; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #3730a3; font-size: 14px;">
                <strong>Note:</strong> This email was sent to you because domain verification is pending. 
                In production, this will be sent to <strong>${email}</strong>
              </p>
            </div>
          ` : ''}
        </div>
      `,
    });
    
    console.log('Reminder email response:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('Resend API returned error:', result.error);
      throw new Error(result.error.message || 'Failed to send reminder email');
    }
    
    if (!result.data || !result.data.id) {
      console.error('Resend API returned no data:', result);
      throw new Error('Email service returned invalid response');
    }
    
    console.log('✅ Reminder email sent successfully to:', sendTo);
    if (isTestMode) {
      console.log('📧 Original recipient:', email);
    }
    
    return result;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
}

export default resend;
