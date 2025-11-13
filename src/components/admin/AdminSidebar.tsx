import { LayoutDashboard, Package, FolderTree, Users, Settings, Warehouse, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useLocation } from 'react-router-dom';
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

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Products', url: '/admin/products', icon: Package },
  { title: 'Categories', url: '/admin/categories', icon: FolderTree },
  { title: 'Inventory', url: '/admin/inventory', icon: Warehouse },
  { title: 'Purchases', url: '/admin/purchases', icon: ShoppingBag },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingCart },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  const { data: settings } = useGetPublicSettingsQuery({});

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
        {!collapsed && settings?.data?.footer_logo && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <img 
              src={settings.data.footer_logo} 
              alt="Footer Logo" 
              className="h-8 object-contain opacity-60"
            />
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
