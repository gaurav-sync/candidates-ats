import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import Stage from '@/models/Stage';
import { getUserFromRequest } from '@/utils/auth';

export async function PATCH(request) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, stageId } = await request.json();

    await connectDB();

    const stage = await Stage.findOne({ _id: stageId, userId });
    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    job.stageId = stageId;
    job.timelineUpdates.push({
      type: 'stage_change',
      title: `Moved to ${stage.name}`,
      description: `Job stage updated to ${stage.name}`,
    });

    await job.save();

    const updatedJob = await Job.findById(job._id).populate('stageId');

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Update stage error:', error);
    return NextResponse.json(
      { error: 'Failed to update stage' },
      { status: 500 }
    );
  }
}
