import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Stage from '@/models/Stage';
import { getUserFromRequest } from '@/utils/auth';

export async function GET(request) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const stages = await Stage.find({ userId }).sort({ order: 1 });

    return NextResponse.json(stages);
  } catch (error) {
    console.error('Get stages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stages' },
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

    const maxOrder = await Stage.findOne({ userId }).sort({ order: -1 });
    const order = maxOrder ? maxOrder.order + 1 : 0;

    const stage = await Stage.create({
      ...data,
      userId,
      order,
    });

    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    console.error('Create stage error:', error);
    return NextResponse.json(
      { error: 'Failed to create stage' },
      { status: 500 }
    );
  }
}
