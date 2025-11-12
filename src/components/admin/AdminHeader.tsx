import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User, Home } from 'lucide-react';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import { Link } from 'react-router-dom';

export const AdminHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-admin-header-border bg-admin-header shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-admin-header-foreground" />
        <h1 className="text-xl font-semibold text-admin-header-foreground">Admin Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-admin-header-foreground hover:bg-admin-header-foreground/10">
            <Home className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-admin-header-foreground" />
          <span className="text-admin-header-foreground font-medium">{user?.name}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-admin-header-foreground hover:bg-admin-header-foreground/10">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
};
