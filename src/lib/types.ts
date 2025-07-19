export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  status: 'online' | 'offline';
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  type: 'text' | 'file' | 'summary';
}

export interface Room {
  id: string;
  name: string;
  type: 'public' | 'dm';
  userIds?: string[];
  lastMessage?: string;
  unreadCount?: number;
}
