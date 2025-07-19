import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Room from '@/models/Room';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const rooms = await Room.find({ members: decoded.user.id })
            .populate('members', 'username');
        return NextResponse.json(rooms);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const { name, isPublic, members = [] } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Room name is required' }, { status: 400 });
        }
        
        // Ensure the creator is always a member
        const finalMembers = [...new Set([decoded.user.id, ...members])];

        const room = new Room({
            name,
            isPublic: isPublic ?? true,
            members: finalMembers,
        });

        await room.save();
        const populatedRoom = await Room.findById(room._id).populate('members', 'username');

        return NextResponse.json(populatedRoom, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
