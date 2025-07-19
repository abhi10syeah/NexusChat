
"use client";

import { useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatWindow } from "@/components/chat-window";
import { useChatStore } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';

export function ChatLayout() {
  const { user, token } = useAuth();
  const { initialize, isDataLoading } = useChatStore();

  useEffect(() => {
    if (user && token) {
      initialize(user, token);
    }
  }, [user, token, initialize]);
  
  if (isDataLoading) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">Loading your chat experience...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="h-full w-full max-w-screen-2xl flex">
        <ChatSidebar />
        <ChatWindow />
      </div>
    </SidebarProvider>
  );
}
