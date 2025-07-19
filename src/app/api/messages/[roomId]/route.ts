import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import Room from '@/models/Room';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const { roomId } = params;

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    // Ensure the user is a member of the room
    if (!room.members.map(m => m.toString()).includes(decoded.user.id)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const messages = await Message.find({ room: roomId })
      .populate('author', 'username')
      .sort({ timestamp: 1 });

    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const { roomId } = params;
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ message: 'Message text is required' }, { status: 400 });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    if (!room.members.map(m => m.toString()).includes(decoded.user.id)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const message = new Message({
      room: roomId,
      author: decoded.user.id,
      text: text,
    });

    await message.save();
    const populatedMessage = await Message.findById(message._id).populate('author', 'username');

    return NextResponse.json(populatedMessage, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
