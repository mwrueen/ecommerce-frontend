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
    dotColor: 'bg-indigo-500',
    items: [
      { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, color: 'text-indigo-500', activeGradient: 'from-indigo-600 via-indigo-500 to-blue-600', iconBg: 'bg-indigo-500/10' },
    ],
  },
  {
    label: 'Catalog',
    dotColor: 'bg-blue-500',
    items: [
      { title: 'Products', url: '/admin/products', icon: Package, color: 'text-blue-500', activeGradient: 'from-blue-600 via-indigo-600 to-blue-700', iconBg: 'bg-blue-500/10' },
      { title: 'Categories', url: '/admin/categories', icon: FolderTree, color: 'text-cyan-500', activeGradient: 'from-cyan-600 via-blue-600 to-indigo-600', iconBg: 'bg-cyan-500/10' },
      { title: 'Inventory', url: '/admin/inventory', icon: Warehouse, color: 'text-sky-500', activeGradient: 'from-sky-600 via-indigo-600 to-blue-600', iconBg: 'bg-sky-500/10' },
      { title: 'Purchases', url: '/admin/purchases', icon: ShoppingBag, color: 'text-teal-500', activeGradient: 'from-teal-600 via-emerald-600 to-teal-700', iconBg: 'bg-teal-500/10' },
    ],
  },
  {
    label: 'Sales',
    dotColor: 'bg-emerald-500',
    items: [
      { title: 'Orders', url: '/admin/orders', icon: ShoppingCart, color: 'text-emerald-500', activeGradient: 'from-emerald-600 via-teal-600 to-emerald-700', iconBg: 'bg-emerald-500/10' },
      { title: 'Coupons', url: '/admin/coupons', icon: Ticket, color: 'text-amber-500', activeGradient: 'from-amber-500 via-orange-500 to-amber-600', iconBg: 'bg-amber-500/10' },
      { title: 'Deals', url: '/admin/deals', icon: Tag, color: 'text-orange-500', activeGradient: 'from-orange-500 via-rose-500 to-red-500', iconBg: 'bg-orange-500/10' },
    ],
  },
  {
    label: 'Customers',
    dotColor: 'bg-purple-500',
    items: [
      { title: 'Customers', url: '/admin/customers', icon: UserCog, color: 'text-purple-500', activeGradient: 'from-purple-600 via-indigo-600 to-violet-600', iconBg: 'bg-purple-500/10' },
      { title: 'Contacts', url: '/admin/contacts', icon: MessageSquare, color: 'text-pink-500', activeGradient: 'from-pink-600 via-rose-600 to-pink-700', iconBg: 'bg-pink-500/10' },
      { title: 'Support Tickets', url: '/admin/support-tickets', icon: LifeBuoy, color: 'text-rose-500', activeGradient: 'from-rose-600 via-pink-600 to-purple-600', iconBg: 'bg-rose-500/10' },
      { title: 'Cancellations', url: '/admin/cancellation-requests', icon: ShoppingCart, color: 'text-red-500', activeGradient: 'from-red-600 via-rose-600 to-orange-600', iconBg: 'bg-red-500/10' },
    ],
  },
  {
    label: 'Administration',
    dotColor: 'bg-violet-500',
    items: [
      { title: 'Users', url: '/admin/users', icon: Users, color: 'text-violet-500', activeGradient: 'from-violet-600 via-purple-600 to-indigo-600', iconBg: 'bg-violet-500/10' },
      { title: 'Roles', url: '/admin/roles', icon: Shield, color: 'text-indigo-500', activeGradient: 'from-indigo-600 via-violet-600 to-purple-600', iconBg: 'bg-indigo-500/10' },
      { title: 'Settings', url: '/admin/settings', icon: Settings, color: 'text-slate-600 dark:text-slate-400', activeGradient: 'from-slate-700 via-slate-800 to-slate-900', iconBg: 'bg-slate-500/10' },
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
    .toUpperCase() || 'A';

  return (
    <Sidebar className={cn(collapsed ? 'w-[72px]' : 'w-72')} collapsible="icon">
      <SidebarContent className="bg-slate-900 text-slate-100 scrollbar-thin shadow-2xl border-r border-slate-800/80">
        {/* Logo Section */}
        <div className={cn(
          "sticky top-0 z-10 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800/80 transition-all duration-300",
          collapsed ? "p-3" : "p-4"
        )}>
          {collapsed ? (
            <div className="flex items-center justify-center">
              {settings?.data?.favicon ? (
                <img
                  src={settings.data.favicon}
                  alt="Logo"
                  className="h-10 w-10 object-contain rounded-xl ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3.5">
              {settings?.data?.favicon ? (
                <img
                  src={settings.data.favicon}
                  alt="Logo"
                  className="h-11 w-11 object-contain rounded-xl ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20"
                />
              ) : (
                <div className="h-11 w-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-white text-base tracking-tight truncate">
                    {settings?.data?.title || 'Admin Portal'}
                  </h2>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">Management Console</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label} className="p-0">
              {!collapsed && (
                <SidebarGroupLabel className="px-3 mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  <span className={cn("h-1.5 w-1.5 rounded-full", group.dotColor)} />
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1.5">
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
                                  "text-slate-400 hover:text-white hover:bg-slate-800/80"
                                )}
                                activeClassName={cn(
                                  "bg-gradient-to-r text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20",
                                  item.activeGradient
                                )}
                              >
                                <item.icon className="h-5 w-5" />
                              </NavLink>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="font-semibold bg-slate-900 border-slate-700 text-white">
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <NavLink
                            to={item.url}
                            end={item.url === '/admin'}
                            className={cn(
                              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 group/item relative overflow-hidden",
                              "text-slate-300 hover:text-white hover:bg-slate-800/70"
                            )}
                            activeClassName={cn(
                              "bg-gradient-to-r text-white font-semibold shadow-lg shadow-indigo-500/20 ring-1 ring-white/20",
                              item.activeGradient
                            )}
                          >
                            {({ isActive }) => (
                              <>
                                <div className={cn(
                                  "p-1.5 rounded-lg transition-all duration-300 shrink-0",
                                  isActive ? "bg-white/20 text-white" : cn(item.iconBg, item.color, "group-hover/item:scale-110")
                                )}>
                                  <item.icon className="h-4 w-4" />
                                </div>
                                <span className="truncate text-sm font-medium">{item.title}</span>
                                <ChevronRight className={cn(
                                  "h-4 w-4 ml-auto transition-all duration-300",
                                  isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover/item:opacity-60 group-hover/item:translate-x-0 text-slate-400"
                                )} />
                              </>
                            )}
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
          "sticky bottom-0 border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-xl transition-all duration-300",
          collapsed ? "p-3" : "p-3.5"
        )}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-3">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Avatar
                    className="h-10 w-10 cursor-pointer ring-2 ring-indigo-500/40 hover:ring-indigo-400 transition-all duration-300 shadow-md"
                    onClick={() => navigate('/admin/profile')}
                  >
                    <AvatarImage src={user?.profile_picture_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900 border-slate-700 text-white">View Profile</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900 border-slate-700 text-white">Logout</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 cursor-pointer transition-all duration-300 shadow-sm"
                onClick={() => navigate('/admin/profile')}
              >
                <Avatar className="h-10 w-10 ring-2 ring-indigo-500/40 shrink-0">
                  <AvatarImage src={user?.profile_picture_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || 'admin@store.com'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-center gap-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl h-9 text-xs font-semibold transition-all duration-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

