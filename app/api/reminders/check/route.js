import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reminder from '@/models/Reminder';
import User from '@/models/User';
import { sendReminderEmail } from '@/lib/resend';

export async function GET(request) {
  try {
    // Simple auth check - in production, use a secret key
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Find reminders that should be sent
    const reminders = await Reminder.find({
      dateTime: { $lte: fiveMinutesFromNow },
      emailSent: false,
      completed: false,
    }).populate('jobId userId');

    let sentCount = 0;

    for (const reminder of reminders) {
      try {
        await sendReminderEmail(
          reminder.userId.email,
          reminder,
          reminder.jobId
        );

        reminder.emailSent = true;
        await reminder.save();
        sentCount++;
      } catch (error) {
        console.error(`Failed to send reminder ${reminder._id}:`, error);
      }
    }

    return NextResponse.json({
      message: `Checked reminders, sent ${sentCount}`,
      sentCount,
    });
  } catch (error) {
    console.error('Reminder check error:', error);
    return NextResponse.json(
      { error: 'Failed to check reminders' },
      { status: 500 }
    );
  }
}
