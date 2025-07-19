
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
  createRoom: (name: string, isPublic: boolean, memberIds?: string[]) => Promise<void>;
  addMembersToRoom: (roomId: string, memberIds: string[]) => Promise<void>;
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

      const allUsers = [user, ...users];

      const populatedRooms = rooms.map(room => {
        if (!room.isPublic && room.members.length === 2) {
          const partnerId = room.members.find((m: any) => m._id !== user._id)?._id;
          const partner = allUsers.find(u => u._id === partnerId);
          return {...room, name: partner?.username || room.name };
        }
        return room;
      });
      
      const finalRooms = populatedRooms.map(r => ({...r, members: r.members.map((m: any) => m._id)}));


      set({ rooms: finalRooms, users: allUsers, isDataLoading: false });
      if (rooms.length > 0) {
        // Select the first public channel by default
        const firstPublicRoom = finalRooms.find(r => r.isPublic && r.name ==='#general');
        if (firstPublicRoom) {
          get().selectRoom(firstPublicRoom._id);
        } else if (finalRooms.length > 0) {
          get().selectRoom(finalRooms[0]._id);
        }
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
              roomId: m.room,
            })),
          },
        }));
      } catch (error) {
        console.error(`Failed to fetch messages for room ${roomId}:`, error);
      }
    }
  },

  createRoom: async (name, isPublic, memberIds = []) => {
    const { rooms, currentUser, users } = get();
    if (!currentUser) throw new Error("User not authenticated");
    
    // Check for existing DM
    if (!isPublic && memberIds.length === 1) {
        const partnerId = memberIds[0];
        const existingRoom = rooms.find(room => 
            !room.isPublic && 
            room.members.length === 2 && 
            room.members.includes(partnerId) && 
            room.members.includes(currentUser._id)
        );
        if (existingRoom) {
            get().selectRoom(existingRoom._id);
            return;
        }
    }

    try {
      const newRoom = await api.createRoom(name, isPublic, memberIds);
      const populatedRoom = { ...newRoom, members: newRoom.members.map((m: any) => m._id) };
      
      set(state => ({
        rooms: [...state.rooms, populatedRoom],
      }));
      get().selectRoom(newRoom._id);
    } catch (error) {
      console.error("Failed to create room:", error);
      throw error;
    }
  },

  addMembersToRoom: async (roomId, memberIds) => {
    try {
      const updatedRoom = await api.addMembersToRoom(roomId, memberIds);
      const finalRoom = { ...updatedRoom, members: updatedRoom.members.map((m: any) => m._id) };

      set(state => ({
        rooms: state.rooms.map(r => r._id === roomId ? finalRoom : r),
      }));
    } catch (error) {
      console.error(`Failed to add members to room ${roomId}:`, error);
      throw error;
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
         roomId: sentMessage.room,
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
      roomId: roomId,
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
      roomId: roomId,
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
