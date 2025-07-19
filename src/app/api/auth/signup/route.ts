import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    let user = await User.findOne({ email });
    if (user) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      passwordHash,
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        username: user.username,
      },
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in the environment variables.');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
