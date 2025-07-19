"use client";

import React, { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';
import { useChatStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { UserAvatar } from './user-avatar';
import { format } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';
import { Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const { users, currentUser } = useChatStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const getSender = (senderId: string) => {
    if (senderId === 'ai-assistant') {
      return { id: 'ai', name: 'AI Assistant', avatarUrl: '', status: 'online' };
    }
    return users.find(user => user.id === senderId);
  };

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 space-y-4">
        {messages.map((message, index) => {
          const sender = getSender(message.senderId);
          const isCurrentUser = message.senderId === currentUser.id;
          const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
          
          if (!sender) return null;

          if (message.type === 'summary') {
            return (
              <div key={message.id} className="relative my-6 text-center">
                 <hr className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-border" />
                 <span className="relative bg-background px-4 text-sm text-muted-foreground flex items-center justify-center gap-2 mx-auto w-fit">
                    <Bot className="w-4 h-4" />
                    Summary Generated
                 </span>
              </div>
            )
          }

          return (
            <div
              key={message.id}
              className={cn('flex items-start gap-3', {
                'justify-end': isCurrentUser,
                'flex-col': showAvatar,
                'pl-11': !showAvatar && !isCurrentUser
              })}
            >
              {!isCurrentUser && showAvatar && (
                <div className="flex items-end gap-2">
                    <UserAvatar user={sender} className="w-8 h-8" />
                    <p className="text-sm font-medium">{sender.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {format(new Date(message.createdAt), 'h:mm a')}
                    </p>
                </div>
              )}
              <div
                className={cn(
                  'max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg',
                  isCurrentUser
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none',
                   !showAvatar && 'mt-1'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {isCurrentUser && showAvatar && (
                 <p className="text-xs text-muted-foreground self-end">
                    {format(new Date(message.createdAt), 'h:mm a')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
