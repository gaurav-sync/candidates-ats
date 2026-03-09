import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import { getUserFromRequest } from '@/utils/auth';

export async function GET(request) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const archived = searchParams.get('archived') === 'true';
    const search = searchParams.get('search');
    const stageId = searchParams.get('stageId');

    let query = { userId, archived };

    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    if (stageId) {
      query.stageId = stageId;
    }

    const jobs = await Job.find(query)
      .populate('stageId')
      .sort({ createdAt: -1 });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
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

    const job = await Job.create({
      ...data,
      userId,
    });

    const populatedJob = await Job.findById(job._id).populate('stageId');

    return NextResponse.json(populatedJob, { status: 201 });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
