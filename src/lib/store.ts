
"use client";

import { create } from 'zustand';
import type { Room, User, Message } from './types';
import { api } from './api';

interface ChatState {
  users: User[];
  rooms: Room[];
  messagesByRoomId: Record<string, Message[]>;
  activeRoomId: string | null;
  typingUsers: Record<string, string[]>;
  currentUser: User | null;
  isDataLoading: boolean;

  // Actions
  initialize: (user: User, token: string) => Promise<void>;
  selectRoom: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  setTyping: (roomId: string, isTyping: boolean) => void;
  addSummaryMessage: (roomId: string, summary: string) => void;
  _addBotMessage: (roomId: string, content: string) => void;
  setCurrentUser: (user: User) => void;
  clearStore: () => void;
}

const useChatStore = create<ChatState>((set, get) => ({
  users: [],
  rooms: [],
  messagesByRoomId: {},
  activeRoomId: null,
  typingUsers: {},
  currentUser: null,
  isDataLoading: true,

  setCurrentUser: (user) => set({ currentUser: user }),
  
  clearStore: () => set({
    users: [],
    rooms: [],
    messagesByRoomId: {},
    activeRoomId: null,
    typingUsers: {},
    currentUser: null,
    isDataLoading: true,
  }),

  initialize: async (user, token) => {
    set({ currentUser: user, isDataLoading: true });
    api.setToken(token);
    try {
      const [rooms, users] = await Promise.all([
        api.getRooms(),
        api.getUsers()
      ]);
      set({ rooms, users, isDataLoading: false });
      if (rooms.length > 0) {
        get().selectRoom(rooms[0]._id);
      }
    } catch (error) {
      console.error("Initialization failed:", error);
      set({ isDataLoading: false });
    }
  },

  selectRoom: async (roomId) => {
    set({ activeRoomId: roomId });
    if (!get().messagesByRoomId[roomId]) {
      try {
        const messages = await api.getMessages(roomId);
        set(state => ({
          messagesByRoomId: {
            ...state.messagesByRoomId,
            [roomId]: messages.map(m => ({
              _id: m._id,
              content: m.text,
              senderId: m.author._id,
              sender: m.author,
              createdAt: m.timestamp,
              type: 'text',
            })),
          },
        }));
      } catch (error) {
        console.error(`Failed to fetch messages for room ${roomId}:`, error);
      }
    }
  },

  sendMessage: async (roomId, content) => {
    try {
      const sentMessage = await api.sendMessage(roomId, content);
      get().addMessage({
         _id: sentMessage._id,
         content: sentMessage.text,
         senderId: sentMessage.author._id,
         sender: sentMessage.author,
         createdAt: sentMessage.timestamp,
         type: 'text',
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  },

  addMessage: (message) => {
    const roomId = message.roomId!;
    set(state => ({
      messagesByRoomId: {
        ...state.messagesByRoomId,
        [roomId]: [...(state.messagesByRoomId[roomId] || []), message],
      },
    }));
  },

  addSummaryMessage: (roomId, summary) => {
    const newMessage: Message = {
      _id: `summary-${Date.now()}`,
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
     if (!currentUser) return;
     const currentTyping = typingUsers[roomId] || [];
     
     if (isTyping && !currentTyping.includes(currentUser._id)) {
        set({
            typingUsers: {
                ...typingUsers,
                [roomId]: [...currentTyping, currentUser._id]
            }
        });
     } else if (!isTyping) {
        set({
            typingUsers: {
                ...typingUsers,
                [roomId]: currentTyping.filter(id => id !== currentUser._id)
            }
        });
     }
  },

  _addBotMessage: (roomId, content) => {
    const botUser = get().users[1];
    if (!botUser) return;
    const newMessage: Message = {
      _id: `msg-${Date.now()}`,
      content,
      senderId: botUser._id,
      createdAt: new Date().toISOString(),
      type: 'text',
    };
    set(state => ({
      messagesByRoomId: {
        ...state.messagesByRoomId,
        [roomId]: [...(state.messagesByRoomId[roomId] || []), newMessage],
      },
    }));

    const currentTyping = get().typingUsers[roomId] || [];
    set(state => ({
        typingUsers: { ...state.typingUsers, [roomId]: [...currentTyping, botUser._id]}
    }))

    setTimeout(() => {
        set(state => ({
            typingUsers: { ...state.typingUsers, [roomId]: (state.typingUsers[roomId] || []).filter(id => id !== botUser._id)}
        }))
    }, 2000);
  },
}));

export { useChatStore };
