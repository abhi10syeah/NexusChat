
export interface User {
  _id: string;
  username: string;
  email: string;
  // Kept for compatibility with old components, can be removed later
  id?: string; 
  name?: string;
  avatarUrl?: string;
  status?: 'online' | 'offline';
}

export interface Message {
  _id: string;
  content: string;
  senderId: string;
  createdAt: string;
  type: 'text' | 'file' | 'summary';
  sender?: { _id: string, username: string };
  roomId: string;
}

export interface Room {
  _id: string;
  name: string;
  isPublic: boolean;
  members: string[];
  createdAt: string;
  // Kept for compatibility with old components, can be removed later
  id?: string;
  type?: 'public' | 'dm';
  lastMessage?: string;
  unreadCount?: number;
}
