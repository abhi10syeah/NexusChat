import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMessage extends Document {
  room: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  text: string;
  timestamp: Date;
}

const MessageSchema: Schema<IMessage> = new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// To prevent model overwrite errors in Next.js HMR
const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
