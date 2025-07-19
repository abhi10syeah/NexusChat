import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/types";

interface UserAvatarProps {
  user: User;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.avatarUrl} alt={user.name} />
      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
