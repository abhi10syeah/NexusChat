"use client";

import { create } from 'zustand';
import type { Room, User, Message } from './types';

const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alice', avatarUrl: 'https://placehold.co/40x40/BF40BF/FFFFFF', status: 'online' },
  { id: 'user-2', name: 'Bob', avatarUrl: 'https://placehold.co/40x40/4B0082/FFFFFF', status: 'online' },
  { id: 'user-3', name: 'Charlie', avatarUrl: 'https://placehold.co/40x40/8A2BE2/FFFFFF', status: 'offline' },
  { id: 'user-4', name: 'David', avatarUrl: 'https://placehold.co/40x40/9932CC/FFFFFF', status: 'online' },
];

const MOCK_ROOMS: Room[] = [
  { id: 'room-1', name: '#general', type: 'public', lastMessage: 'See you there!', unreadCount: 3 },
  { id: 'room-2', name: '#random', type: 'public', lastMessage: 'Has anyone seen the new trailer?', unreadCount: 0 },
  { id: 'room-3', name: '#tech', type: 'public', lastMessage: 'Just pushed a new update.', unreadCount: 1 },
  { id: 'dm-1', name: 'Bob', type: 'dm', userIds: ['user-1', 'user-2'], lastMessage: 'Hey, are you free for a call?', unreadCount: 1 },
  { id: 'dm-2', name: 'Charlie', type: 'dm', userIds: ['user-1', 'user-3'], lastMessage: 'Okay, sounds good.', unreadCount: 0 },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  'room-1': [
    { id: 'msg-1-1', content: 'Hey everyone!', senderId: 'user-1', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'text' },
    { id: 'msg-1-2', content: 'Hello Alice!', senderId: 'user-2', createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(), type: 'text' },
    { id: 'msg-1-3', content: 'Meeting at 3 PM today.', senderId: 'user-4', createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), type: 'text' },
    { id: 'msg-1-4', content: 'Got it, thanks for the reminder.', senderId: 'user-1', createdAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(), type: 'text' },
    { id: 'msg-1-5', content: 'See you there!', senderId: 'user-2', createdAt: new Date().toISOString(), type: 'text' },
  ],
  'dm-1': [
     { id: 'msg-dm-1-1', content: 'Hey, are you free for a call?', senderId: 'user-2', createdAt: new Date().toISOString(), type: 'text' },
  ]
};

interface ChatState {
  users: User[];
  rooms: Room[];
  messagesByRoomId: Record<string, Message[]>;
  activeRoomId: string | null;
  typingUsers: Record<string, string[]>;
  currentUser: User;
  selectRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  setTyping: (roomId: string, isTyping: boolean) => void;
  addSummaryMessage: (roomId: string, summary: string) => void;
  _addBotMessage: (roomId: string, content: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  users: MOCK_USERS,
  rooms: MOCK_ROOMS,
  messagesByRoomId: MOCK_MESSAGES,
  activeRoomId: 'room-1',
  typingUsers: {},
  currentUser: MOCK_USERS[0],
  selectRoom: (roomId) => set({ activeRoomId: roomId }),
  sendMessage: (roomId, content) => {
    const { currentUser } = get();
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      type: 'text',
    };
    set(state => ({
      messagesByRoomId: {
        ...state.messagesByRoomId,
        [roomId]: [...(state.messagesByRoomId[roomId] || []), newMessage],
      },
    }));
  },
  addSummaryMessage: (roomId, summary) => {
    const newMessage: Message = {
      id: `summary-${Date.now()}`,
      content: summary,
      senderId: 'ai-assistant',
      createdAt: new Date().toISOString(),
      type: 'summary',
    };
     set(state => ({
      messagesByRoomId: {
        ...state.messagesByRoomId,
        [roomId]: [...(state.messagesByRoomId[roomId] || []), newMessage],
      },
    }));
  },
  setTyping: (roomId, isTyping) => {
     const { currentUser, typingUsers } = get();
     const currentTyping = typingUsers[roomId] || [];
     
     if (isTyping && !currentTyping.includes(currentUser.id)) {
        set({
            typingUsers: {
                ...typingUsers,
                [roomId]: [...currentTyping, currentUser.id]
            }
        });
     } else if (!isTyping) {
        set({
            typingUsers: {
                ...typingUsers,
                [roomId]: currentTyping.filter(id => id !== currentUser.id)
            }
        });
     }
  },
  _addBotMessage: (roomId, content) => {
    const botUser = get().users[1]; // Bob
    if (!botUser) return;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      senderId: botUser.id,
      createdAt: new Date().toISOString(),
      type: 'text',
    };
    set(state => ({
      messagesByRoomId: {
        ...state.messagesByRoomId,
        [roomId]: [...(state.messagesByRoomId[roomId] || []), newMessage],
      },
    }));

    // Simulate bot typing
    const currentTyping = get().typingUsers[roomId] || [];
    set(state => ({
        typingUsers: { ...state.typingUsers, [roomId]: [...currentTyping, botUser.id]}
    }))

    setTimeout(() => {
        set(state => ({
            typingUsers: { ...state.typingUsers, [roomId]: (state.typingUsers[roomId] || []).filter(id => id !== botUser.id)}
        }))
    }, 2000);
  },
}));
