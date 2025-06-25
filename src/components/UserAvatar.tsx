
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarProps {
  name: string;
  className?: string;
}

const UserAvatar = ({ name, className }: UserAvatarProps) => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-black font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
