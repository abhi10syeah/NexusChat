
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  user: { name: string, avatarUrl?: string };
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.avatarUrl} alt={user.name} />
      <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : '?'}</AvatarFallback>
    </Avatar>
  );
}
