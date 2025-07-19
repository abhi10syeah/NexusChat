
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
      return { _id: 'ai', username: 'AI Assistant', name: 'AI Assistant', avatarUrl: '' };
    }
    if (currentUser?._id === senderId) {
      return { ...currentUser, name: currentUser.username };
    }
    const user = users.find(user => user._id === senderId);
    return user ? {...user, name: user.username} : { _id: 'unknown', username: 'Unknown', name: 'Unknown', avatarUrl: ''};
  };

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 space-y-1">
        {messages.map((message, index) => {
          const sender = getSender(message.senderId);
          const isCurrentUser = currentUser ? message.senderId === currentUser._id : false;
          
          const prevMessage = messages[index - 1];
          const nextMessage = messages[index + 1];

          const isFirstInGroup = !prevMessage || prevMessage.senderId !== message.senderId;
          const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;

          if (!sender) return null;

          if (message.type === 'summary') {
            return (
              <div key={message._id} className="relative my-6 text-center">
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
              key={message._id}
              className={cn('flex items-end gap-2', {
                'justify-end': isCurrentUser,
                'mt-4': isFirstInGroup,
              })}
            >
              {!isCurrentUser && (
                <UserAvatar 
                    user={sender} 
                    className={cn(
                      'w-8 h-8', 
                      isLastInGroup ? 'visible' : 'invisible'
                    )} 
                />
              )}
              <div
                className={cn(
                  'max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg flex flex-col',
                  isCurrentUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted',
                  isFirstInGroup && !isCurrentUser && 'rounded-tl-none',
                  isFirstInGroup && isCurrentUser && 'rounded-tr-none',
                  isLastInGroup && !isCurrentUser && 'rounded-bl-none',
                  isLastInGroup && isCurrentUser && 'rounded-br-none',
                )}
              >
                {!isCurrentUser && isFirstInGroup && (
                    <p className="text-xs font-semibold mb-1 text-primary">{sender.name}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                 <p className={cn(
                    "text-xs mt-1 self-end",
                    isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground/70"
                 )}>
                    {format(new Date(message.createdAt), 'h:mm a')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
