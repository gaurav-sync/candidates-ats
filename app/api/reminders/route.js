import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reminder from '@/models/Reminder';
import { getUserFromRequest } from '@/utils/auth';

export async function GET(request) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    let query = { userId };
    if (jobId) {
      query.jobId = jobId;
    }

    const reminders = await Reminder.find(query)
      .populate('jobId')
      .sort({ dateTime: 1 });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    await connectDB();

    const reminder = await Reminder.create({
      ...data,
      userId,
    });

    const populatedReminder = await Reminder.findById(reminder._id).populate('jobId');

    return NextResponse.json(populatedReminder, { status: 201 });
  } catch (error) {
    console.error('Create reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}
