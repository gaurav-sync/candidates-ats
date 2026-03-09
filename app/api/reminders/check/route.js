import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reminder from '@/models/Reminder';
import User from '@/models/User';
import { sendReminderEmail } from '@/lib/resend';

export async function GET(request) {
  try {
    // Check for Vercel Cron secret or manual auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret';
    
    // Allow Vercel Cron (no auth header) or manual calls with secret
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron');
    const isAuthorized = authHeader === `Bearer ${cronSecret}`;
    
    if (!isVercelCron && !isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    console.log('Checking reminders at:', now.toISOString());

    // Find reminders that should be sent
    const reminders = await Reminder.find({
      dateTime: { $lte: fiveMinutesFromNow },
      emailSent: false,
      completed: false,
    }).populate('jobId userId');

    console.log(`Found ${reminders.length} reminders to process`);

    let sentCount = 0;
    const errors = [];

    for (const reminder of reminders) {
      try {
        console.log(`Sending reminder ${reminder._id} to ${reminder.userId.email}`);
        
        await sendReminderEmail(
          reminder.userId.email,
          reminder,
          reminder.jobId
        );

        reminder.emailSent = true;
        await reminder.save();
        sentCount++;
        
        console.log(`Successfully sent reminder ${reminder._id}`);
      } catch (error) {
        console.error(`Failed to send reminder ${reminder._id}:`, error);
        errors.push({
          reminderId: reminder._id,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: `Checked reminders, sent ${sentCount}`,
      sentCount,
      totalFound: reminders.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Reminder check error:', error);
    return NextResponse.json(
      { error: 'Failed to check reminders', details: error.message },
      { status: 500 }
    );
  }
}
