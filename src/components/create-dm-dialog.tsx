
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChatStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "./user-avatar";

export function CreateDmDialog() {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { users, createRoom, rooms } = useChatStore();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const otherUsers = users.filter(u => u._id !== currentUser?._id);

  const handleCreateDm = async (userId: string) => {
    setIsCreating(true);
    try {
      // Find the user object for the name
      const targetUser = users.find(u => u._id === userId);
      if (!targetUser) {
        throw new Error("User not found");
      }

      // Check if a DM room with this user already exists
      const existingDm = rooms.find(room => 
        !room.isPublic &&
        room.members.length === 2 &&
        room.members.includes(userId) &&
        room.members.includes(currentUser!._id)
      );

      if (existingDm) {
        toast({
            title: "Direct Message already exists",
            description: `You already have a conversation with ${targetUser.username}.`,
        });
        setOpen(false);
        return;
      }

      const roomName = `@${targetUser.username}`;
      await createRoom(roomName, false, [userId]);
      
      toast({
        title: "Direct Message Created",
        description: `You can now chat with ${targetUser.username}.`,
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to Create DM",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Start Direct Message</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start a new conversation</DialogTitle>
          <DialogDescription>
            Select a user to start a private one-on-one conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ScrollArea className="h-64">
                <div className="flex flex-col gap-2">
                {otherUsers.map((user) => (
                    <Button
                        key={user._id}
                        variant="ghost"
                        className="w-full flex justify-start items-center gap-3 p-2 h-auto"
                        onClick={() => handleCreateDm(user._id)}
                        disabled={isCreating}
                    >
                        <UserAvatar user={{...user, name: user.username}} className="w-8 h-8" />
                        <span className="font-medium">{user.username}</span>
                        {isCreating && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
                    </Button>
                ))}
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
