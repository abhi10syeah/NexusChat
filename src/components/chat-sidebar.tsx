
"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { UserAvatar } from "./user-avatar";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { LogOut, MessageSquare, Users } from "lucide-react";
import { useChatStore } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";

export function ChatSidebar() {
  const { rooms, activeRoomId, selectRoom } = useChatStore();
  const { user, logout } = useAuth();

  const publicRooms = rooms.filter((room) => room.isPublic);
  const directMessages = rooms.filter((room) => !room.isPublic);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>
            <h1 className="text-xl font-semibold font-headline">Nexus Chat</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <MessageSquare className="mr-2" />
            Channels
          </SidebarGroupLabel>
          <SidebarMenu>
            {publicRooms.map((room) => (
              <SidebarMenuItem key={room._id}>
                <SidebarMenuButton
                  onClick={() => selectRoom(room._id)}
                  isActive={activeRoomId === room._id}
                  className="justify-between"
                >
                  <span className="truncate">{room.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <Users className="mr-2" />
            Direct Messages
          </SidebarGroupLabel>
          <SidebarMenu>
             {directMessages.length === 0 && (
                <p className="text-xs text-muted-foreground px-2">No direct messages yet.</p>
             )}
            {directMessages.map((room) => (
              <SidebarMenuItem key={room._id}>
                <SidebarMenuButton
                  onClick={() => selectRoom(room._id)}
                  isActive={activeRoomId === room._id}
                  className="justify-between"
                >
                  <span className="truncate">{room.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      {user && (
        <SidebarFooter>
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <UserAvatar user={{...user, name: user.username}} className="w-8 h-8"/>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
