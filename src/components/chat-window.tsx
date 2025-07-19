
"use client";

import React, { useState } from 'react';
import { useChatStore } from '@/lib/store';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { UserAvatar } from './user-avatar';
import { Bot, Loader2, MessageSquareDashed } from 'lucide-react';
import { Button } from './ui/button';
import { summarizeChatroom } from '@/ai/flows/summarize-chatroom';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from './ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { AddMembersDialog } from './add-members-dialog';

export function ChatWindow() {
  const {
    activeRoomId,
    rooms,
    users,
    messagesByRoomId,
    typingUsers,
    addSummaryMessage
  } = useChatStore();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const activeRoom = rooms.find(room => room._id === activeRoomId);
  const messages = activeRoomId ? messagesByRoomId[activeRoomId] || [] : [];
  const roomTypingUsers = (activeRoomId ? typingUsers[activeRoomId] : []) || [];
  const roomTypingUserObjects = users.filter(user => roomTypingUsers.includes(user._id));

  const handleSummarize = async () => {
    if (!activeRoomId) return;
    setIsSummarizing(true);
    try {
      const last20Messages = messages.slice(-20).map(m => {
        const sender = users.find(u => u._id === m.senderId)?.username || 'Unknown';
        return `${sender}: ${m.content}`;
      });
      
      if (last20Messages.length < 3) {
        toast({
          title: "Not enough messages",
          description: "Need at least 3 messages to create a summary.",
          variant: "destructive"
        });
        setIsSummarizing(false);
        return;
      }

      const result = await summarizeChatroom({ messages: last20Messages });
      addSummaryMessage(activeRoomId, result.summary);
      setSummary(result.summary);

    } catch (error) {
      console.error('Failed to summarize chat:', error);
      toast({
        title: "Summarization Failed",
        description: "Could not generate a summary at this time.",
        variant: "destructive"
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const getRoomDisplayName = () => {
    if (!activeRoom) return "";
    if (activeRoom.isPublic) return activeRoom.name;

    const partnerId = activeRoom.members.find(id => id !== currentUser?._id);
    const partner = users.find(u => u._id === partnerId);
    return partner ? partner.username : "Direct Message";
  }

  const getRoomUsers = () => {
    if (!activeRoom) return [];
    return users.filter(u => activeRoom.members.some(mId => mId === u._id));
  };
  
  const roomUsers = getRoomUsers();

  if (!activeRoomId || !activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/50 h-full">
        <MessageSquareDashed className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-muted-foreground mb-2">Welcome to Nexus Chat</h2>
        <p className="text-muted-foreground">Select a channel or conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-bold font-headline">
            {getRoomDisplayName()}
          </h2>
          <p className="text-sm text-muted-foreground">{activeRoom.isPublic ? `${roomUsers.length} members` : 'Direct Message'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2 overflow-hidden">
            {roomUsers.slice(0,3).map(user => <UserAvatar key={user._id} user={{...user, name: user.username}} className="w-8 h-8 border-2 border-background" />)}
            {roomUsers.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold border-2 border-background">
                    +{roomUsers.length - 3}
                </div>
            )}
          </div>
          {activeRoom.isPublic && <AddMembersDialog room={activeRoom} />}
          <Button variant="outline" size="sm" onClick={handleSummarize} disabled={isSummarizing}>
            {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            Summarize
          </Button>
        </div>
      </header>
      <MessageList messages={messages} />
      <div className="p-4 border-t">
        <div className="h-6 text-sm text-muted-foreground italic transition-opacity duration-300">
            {roomTypingUserObjects.length > 0 &&
                `${roomTypingUserObjects.map(u => u.username).join(', ')} ${roomTypingUserObjects.length === 1 ? 'is' : 'are'} typing...`
            }
        </div>
        <MessageInput roomId={activeRoomId} />
      </div>

      <AlertDialog open={!!summary} onOpenChange={(open) => !open && setSummary(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Bot className="w-5 h-5"/>Chat Summary</AlertDialogTitle>
            <AlertDialogDescription>
              Here is a summary of the recent conversation. This was also added to the chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 text-sm">{summary}</div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSummary(null)}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
