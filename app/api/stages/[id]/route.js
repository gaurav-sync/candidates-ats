import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Stage from '@/models/Stage';
import Job from '@/models/Job';
import { getUserFromRequest } from '@/utils/auth';

export async function PUT(request, { params }) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    await connectDB();

    const stage = await Stage.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true }
    );

    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    return NextResponse.json(stage);
  } catch (error) {
    console.error('Update stage error:', error);
    return NextResponse.json(
      { error: 'Failed to update stage' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const stage = await Stage.findOne({ _id: id, userId });
    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    // Check if any jobs are using this stage
    const jobsCount = await Job.countDocuments({ stageId: id, userId });
    if (jobsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete stage with active jobs' },
        { status: 400 }
      );
    }

    await Stage.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Stage deleted successfully' });
  } catch (error) {
    console.error('Delete stage error:', error);
    return NextResponse.json(
      { error: 'Failed to delete stage' },
      { status: 500 }
    );
  }
}
