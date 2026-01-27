import { Link } from 'react-router-dom';
import { User as UserIcon, LogOut, Package, Settings, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function UserMenu() {
  const { user, logout, isAdmin } = useAuth();

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline" className="rounded-xl h-9 sm:h-10 px-3 sm:px-4">
          <UserIcon className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Sign In</span>
        </Button>
      </Link>
    );
  }

  const initials = user.name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || 'U';
  const avatarUrl = undefined; // No avatar in User interface yet

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors">
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatarUrl} alt={user.email || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground truncate">
            {user.name || user.email}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
            <Package className="w-4 h-4" />
            My Orders
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu >
  );
}
