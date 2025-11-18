import { LayoutDashboard, Package, FolderTree, Users, Settings, Warehouse, ShoppingCart, ShoppingBag, LogOut, UserCog, Shield, Ticket, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { useGetPublicSettingsQuery } from '@/store/api/siteSettingsApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Products', url: '/admin/products', icon: Package },
  { title: 'Categories', url: '/admin/categories', icon: FolderTree },
  { title: 'Inventory', url: '/admin/inventory', icon: Warehouse },
  { title: 'Purchases', url: '/admin/purchases', icon: ShoppingBag },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingCart },
  { title: 'Coupons', url: '/admin/coupons', icon: Ticket },
  { title: 'Customers', url: '/admin/customers', icon: UserCog },
  { title: 'Contacts', url: '/admin/contacts', icon: MessageSquare },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Roles', url: '/admin/roles', icon: Shield },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const collapsed = state === 'collapsed';
  const { data: settings } = useGetPublicSettingsQuery({});
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userInitials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent className="bg-sidebar">
        <div className="p-4 border-b border-sidebar-border bg-sidebar-accent/30">
          {collapsed ? (
            <div className="flex items-center justify-center">
              {settings?.data?.favicon ? (
                <img 
                  src={settings.data.favicon} 
                  alt="Logo" 
                  className="h-8 w-8 object-contain rounded"
                />
              ) : (
                <div className="h-8 w-8 bg-sidebar-primary rounded flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground font-bold text-xs">AP</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {settings?.data?.favicon && (
                <img 
                  src={settings.data.favicon} 
                  alt="Logo" 
                  className="h-10 w-10 object-contain rounded"
                />
              )}
              <div className="flex flex-col">
                <h2 className="font-bold text-sidebar-foreground text-base">
                  {settings?.data?.title || 'Admin Panel'}
                </h2>
                <p className="text-xs text-sidebar-foreground/60">Management</p>
              </div>
            </div>
          )}
        </div>
        <SidebarGroup className="pt-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="hover:bg-sidebar-accent transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground py-3"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-md"
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto border-t border-sidebar-border">
          {collapsed ? (
            <div className="p-3 flex flex-col items-center gap-2">
              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate('/admin/profile')}>
                <AvatarImage src={user?.profile_picture_url || ''} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profile_picture_url || ''} />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/profile')}
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <UserCog className="h-4 w-4 mr-2" />
                My Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
