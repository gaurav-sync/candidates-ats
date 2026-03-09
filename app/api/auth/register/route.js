import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateOTP } from '@/utils/auth';
import { sendOTPEmail } from '@/lib/resend';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log('Registration attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    console.log('Existing user check:', existingUser ? `Found user (verified: ${existingUser.verified}, isPending: ${existingUser.isPending})` : 'No user found');
    
    // If user exists and is verified (account is active), don't allow re-registration
    if (existingUser && existingUser.verified) {
      return NextResponse.json(
        { error: 'User already exists. Please login instead.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Generated OTP:', otp);

    // Try to send email BEFORE creating/updating user
    console.log('Attempting to send OTP email...');
    try {
      const emailResult = await sendOTPEmail(email, otp);
      console.log('OTP email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Don't create user if email fails
      return NextResponse.json(
        { 
          error: 'Failed to send verification email. Please try again or check your email address.',
          details: emailError.message 
        },
        { status: 500 }
      );
    }

    // If user exists (either pending or unverified), update with new OTP
    // Otherwise create new user
    let user;
    if (existingUser) {
      console.log('Updating existing unverified account with new OTP for:', email);
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      existingUser.isPending = true;
      existingUser.verified = false;
      user = await existingUser.save();
    } else {
      console.log('Email sent successfully, creating pending user...');
      user = await User.create({
        email,
        password: hashedPassword,
        otp,
        otpExpiry,
        verified: false,
        isPending: true,
      });
    }

    console.log('Pending user created successfully:', user._id);

    return NextResponse.json({
      message: 'Registration successful. Please check your email for OTP.',
      userId: user._id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}
