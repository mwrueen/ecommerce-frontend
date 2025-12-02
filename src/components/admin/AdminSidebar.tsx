import { LayoutDashboard, Package, FolderTree, Users, Settings, Warehouse, ShoppingCart, ShoppingBag, LogOut, UserCog, Shield, Ticket, MessageSquare, Tag, LifeBuoy, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const menuGroups = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { title: 'Products', url: '/admin/products', icon: Package },
      { title: 'Categories', url: '/admin/categories', icon: FolderTree },
      { title: 'Inventory', url: '/admin/inventory', icon: Warehouse },
      { title: 'Purchases', url: '/admin/purchases', icon: ShoppingBag },
    ],
  },
  {
    label: 'Sales',
    items: [
      { title: 'Orders', url: '/admin/orders', icon: ShoppingCart },
      { title: 'Coupons', url: '/admin/coupons', icon: Ticket },
      { title: 'Deals', url: '/admin/deals', icon: Tag },
    ],
  },
  {
    label: 'Customers',
    items: [
      { title: 'Customers', url: '/admin/customers', icon: UserCog },
      { title: 'Contacts', url: '/admin/contacts', icon: MessageSquare },
      { title: 'Support Tickets', url: '/admin/support-tickets', icon: LifeBuoy },
      { title: 'Cancellations', url: '/admin/cancellation-requests', icon: ShoppingCart },
    ],
  },
  {
    label: 'Administration',
    items: [
      { title: 'Users', url: '/admin/users', icon: Users },
      { title: 'Roles', url: '/admin/roles', icon: Shield },
      { title: 'Settings', url: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
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
    <Sidebar className={cn(collapsed ? 'w-[70px]' : 'w-72')} collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 scrollbar-thin shadow-xl shadow-sidebar-border/10">
        {/* Logo Section */}
        <div className={cn(
          "sticky top-0 z-10 backdrop-blur-xl bg-gradient-to-r from-sidebar via-sidebar to-sidebar/90 border-b border-sidebar-border/50",
          collapsed ? "p-3" : "p-5"
        )}>
          {collapsed ? (
            <div className="flex items-center justify-center">
              {settings?.data?.favicon ? (
                <img
                  src={settings.data.favicon}
                  alt="Logo"
                  className="h-10 w-10 object-contain rounded-xl ring-2 ring-sidebar-primary/30 shadow-md"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-sidebar-primary via-sidebar-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-sidebar-primary/30">
                  <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {settings?.data?.favicon ? (
                <img
                  src={settings.data.favicon}
                  alt="Logo"
                  className="h-12 w-12 object-contain rounded-xl ring-2 ring-sidebar-primary/30 shadow-lg"
                />
              ) : (
                <div className="h-12 w-12 bg-gradient-to-br from-sidebar-primary via-sidebar-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-sidebar-primary/30">
                  <Sparkles className="h-6 w-6 text-sidebar-primary-foreground" />
                </div>
              )}
              <div className="flex flex-col">
                <h2 className="font-bold text-sidebar-foreground text-lg tracking-tight">
                  {settings?.data?.title || 'Admin Panel'}
                </h2>
                <p className="text-xs text-sidebar-foreground/60 font-medium tracking-wide">Management Console</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label} className="p-0">
              {!collapsed && (
                <SidebarGroupLabel className="px-3 mb-2.5 text-[10px] uppercase tracking-widest font-bold text-sidebar-foreground/50">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        {collapsed ? (
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <NavLink
                                to={item.url}
                                end={item.url === '/admin'}
                                className={cn(
                                  "flex items-center justify-center w-full h-11 rounded-xl transition-all duration-300",
                                  "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 hover:shadow-sm"
                                )}
                                activeClassName="bg-gradient-to-r from-sidebar-primary to-primary-dark text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/20"
                              >
                                <item.icon className="h-5 w-5" />
                              </NavLink>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="font-medium">
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <NavLink
                            to={item.url}
                            end={item.url === '/admin'}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group/item",
                              "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/70 hover:shadow-sm"
                            )}
                            activeClassName="bg-gradient-to-r from-sidebar-primary to-primary-dark text-sidebar-primary-foreground font-medium shadow-md shadow-sidebar-primary/20"
                          >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="truncate font-medium">{item.title}</span>
                            <ChevronRight className="h-4 w-4 ml-auto opacity-0 -translate-x-2 group-hover/item:opacity-60 group-hover/item:translate-x-0 transition-all duration-300" />
                          </NavLink>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>

        {/* User Section */}
        <div className={cn(
          "sticky bottom-0 border-t border-sidebar-border/50 bg-gradient-to-t from-sidebar via-sidebar to-sidebar/90 backdrop-blur-xl",
          collapsed ? "p-3" : "p-4"
        )}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-3">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Avatar
                    className="h-10 w-10 cursor-pointer ring-2 ring-sidebar-primary/30 hover:ring-sidebar-primary/50 transition-all duration-300 shadow-sm"
                    onClick={() => navigate('/admin/profile')}
                  >
                    <AvatarImage src={user?.profile_picture_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-sidebar-primary to-primary-dark text-sidebar-primary-foreground text-sm font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">View Profile</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-10 w-10 rounded-xl text-sidebar-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/40 hover:bg-sidebar-accent/70 cursor-pointer transition-all duration-300 shadow-sm hover:shadow"
                onClick={() => navigate('/admin/profile')}
              >
                <Avatar className="h-11 w-11 ring-2 ring-sidebar-primary/30 shadow-sm">
                  <AvatarImage src={user?.profile_picture_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-sidebar-primary to-primary-dark text-sidebar-primary-foreground font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user?.email || ''}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-sidebar-foreground/40" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-center gap-2 text-sidebar-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl h-10 font-medium transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
