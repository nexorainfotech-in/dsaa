import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Code, LogOut, User, BarChart3 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onAuthClick: () => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onAuthClick, currentPage = 'dashboard', onNavigate }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="w-full px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Code className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            DSA Tracker
          </span>
        </div>

        {user && onNavigate && (
          <nav className="hidden md:flex items-center gap-3">
            <Button
              variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => onNavigate('dashboard')}
              className="transition-colors"
            >
              Dashboard
            </Button>
            <Button
              variant={currentPage === 'profile' ? 'default' : 'ghost'}
              onClick={() => onNavigate('profile')}
              className="transition-colors"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Profile
            </Button>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-gray-200 hover:border-blue-300">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 border border-gray-200" align="end" forceMount>
                <DropdownMenuItem className="font-normal p-2">
                  <User className="mr-2 h-3 w-3" />
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                  </div>
                </DropdownMenuItem>
                {onNavigate && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate('dashboard')} className="p-2">
                      <Code className="mr-2 h-3 w-3" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('profile')} className="p-2">
                      <BarChart3 className="mr-2 h-3 w-3" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="p-2 text-red-600 hover:bg-red-50">
                  <LogOut className="mr-2 h-3 w-3" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={onAuthClick} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};