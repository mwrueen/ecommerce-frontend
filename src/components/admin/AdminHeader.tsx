import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Search, Command } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetPublicSettingsQuery } from '@/store/api/siteSettingsApi';
import { NotificationDropdown } from './NotificationDropdown';
import { SupportTicketDropdown } from './SupportTicketDropdown';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const AdminHeader = () => {
  const { data: settings } = useGetPublicSettingsQuery({});

  return (
    <header className={cn(
      "h-14 border-b bg-background/95",
      "flex items-center gap-4 px-6",
      "sticky top-0 z-30 backdrop-blur-xl"
    )}>
      <SidebarTrigger className="hover:bg-muted rounded-lg h-8 w-8 shrink-0" />

      <div className="h-5 w-px bg-border shrink-0" />

      {settings?.data?.header_logo && (
        <img
          src={settings.data.header_logo}
          alt={settings.data.business_name || 'Logo'}
          className="h-7 object-contain hidden md:block shrink-0"
        />
      )}

      <div className="hidden lg:block shrink-0">
        <h1 className="text-sm font-semibold">
          {settings?.data?.business_name || 'Admin Dashboard'}
        </h1>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-sm ml-auto">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search..."
            className="pl-9 pr-12 h-9 bg-muted/50 border-0 hover:bg-muted focus:bg-background rounded-lg text-sm"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded bg-background border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <NotificationDropdown />
        <SupportTicketDropdown />

        <div className="h-5 w-px bg-border mx-2 hidden md:block" />

        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg gap-2 h-8 px-3 text-sm font-medium hover:bg-muted"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Store</span>
          </Button>
        </Link>
      </div>
    </header>
  );
};
