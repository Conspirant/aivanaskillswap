
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, FileText, Calendar, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UserAvatar from './UserAvatar';

interface UserDropdownProps {
  userName: string;
  userEmail: string;
}

const UserDropdown = ({ userName, userEmail }: UserDropdownProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAdmin = userEmail === 'your@email.com'; // Replace with your email

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-yellow-400/10">
          <UserAvatar name={userName} className="h-10 w-10" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-gradient-to-br from-gray-900/95 to-black/95 border-yellow-500/30 text-white backdrop-blur-xl"
        align="end"
        forceMount
      >
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none text-yellow-400">{userName}</p>
          <p className="text-xs leading-none text-gray-400">{userEmail}</p>
        </div>
        
        <DropdownMenuSeparator className="bg-yellow-500/20" />
        
        <DropdownMenuItem 
          className="text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400 cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <User className="mr-2 h-4 w-4" />
          My Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <FileText className="mr-2 h-4 w-4" />
          My Skill Cards
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400 cursor-pointer"
          onClick={() => navigate('/my-sessions')}
        >
          <Calendar className="mr-2 h-4 w-4" />
          My Sessions
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator className="bg-yellow-500/20" />
            <DropdownMenuItem 
              className="text-red-400 hover:bg-red-400/10 hover:text-red-300 cursor-pointer"
              onClick={() => navigate('/admin')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin Panel
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator className="bg-yellow-500/20" />
        
        <DropdownMenuItem 
          className="text-gray-300 hover:bg-red-400/10 hover:text-red-400 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
