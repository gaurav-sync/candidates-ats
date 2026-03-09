import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Stage from '@/models/Stage';
import { generateToken } from '@/utils/auth';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.verified) {
      return NextResponse.json(
        { error: 'User already verified' },
        { status: 400 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    if (new Date() > user.otpExpiry) {
      return NextResponse.json(
        { error: 'OTP expired' },
        { status: 400 }
      );
    }

    // Activate the account by setting verified to true and isPending to false
    user.verified = true;
    user.isPending = false;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Create default stages for the user
    const defaultStages = [
      { name: 'Applied', order: 0, isDefault: true, color: '#6366f1' },
      { name: 'HR Screening', order: 1, isDefault: true, color: '#8b5cf6' },
      { name: 'Technical Round', order: 2, isDefault: true, color: '#ec4899' },
      { name: 'Assignment', order: 3, isDefault: true, color: '#f59e0b' },
      { name: 'Manager Round', order: 4, isDefault: true, color: '#10b981' },
      { name: 'Final Round', order: 5, isDefault: true, color: '#06b6d4' },
      { name: 'Offer', order: 6, isDefault: true, color: '#22c55e' },
      { name: 'Rejected', order: 7, isDefault: true, color: '#ef4444' },
    ];

    await Stage.insertMany(
      defaultStages.map(stage => ({ ...stage, userId: user._id }))
    );

    const token = generateToken(user._id);

    return NextResponse.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
