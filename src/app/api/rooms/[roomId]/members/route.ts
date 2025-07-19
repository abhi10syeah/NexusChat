
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Room from '@/models/Room';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const { roomId } = params;
    const { memberIds } = await req.json();

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ message: 'Member IDs are required' }, { status: 400 });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    // Optional: Only allow members to add other members. For public rooms, you might remove this check.
    if (!room.members.map(m => m.toString()).includes(decoded.user.id)) {
      return NextResponse.json({ message: 'Forbidden: You are not a member of this room' }, { status: 403 });
    }

    // Add only new members
    const newMembers = memberIds.filter(id => !room.members.map(m => m.toString()).includes(id));
    
    if (newMembers.length > 0) {
        room.members.push(...newMembers);
        await room.save();
    }
    
    const populatedRoom = await Room.findById(room._id).populate('members', 'username _id');

    return NextResponse.json(populatedRoom);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
