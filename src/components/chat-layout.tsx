"use client";

import { useEffect, useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatWindow } from "@/components/chat-window";
import { useChatStore } from '@/lib/store';

export function ChatLayout() {
  const { _addBotMessage } = useChatStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Simulate a bot message after a delay to make the chat feel alive
    const timer = setTimeout(() => {
      _addBotMessage('room-1', 'Welcome to Nexus Chat! Feel free to look around.');
    }, 2000);

    return () => clearTimeout(timer);
  }, [isClient, _addBotMessage]);

  if (!isClient) {
    return null; // or a loading spinner
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
