import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  isPublic: boolean;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const RoomSchema: Schema<IRoom> = new Schema({
  name: { type: String, required: true },
  isPublic: { type: Boolean, default: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
