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
      "h-16 border-b border-border/40 bg-white/80 dark:bg-slate-900/80",
      "flex items-center gap-4 px-6",
      "sticky top-0 z-30 backdrop-blur-xl shadow-sm"
    )}>
      <SidebarTrigger className="hover:bg-primary/10 hover:text-primary rounded-xl h-9 w-9 shrink-0 transition-all duration-300" />

      <div className="h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent shrink-0" />

      {settings?.data?.header_logo && (
        <img
          src={settings.data.header_logo}
          alt={settings.data.business_name || 'Logo'}
          className="h-8 object-contain hidden md:block shrink-0"
        />
      )}

      <div className="hidden lg:block shrink-0">
        <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {settings?.data?.business_name || 'Admin Dashboard'}
        </h1>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md ml-auto">
        <div className="relative w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
          <Input
            placeholder="Search anything..."
            className="pl-10 pr-14 h-10 bg-muted/40 border border-border/50 hover:bg-muted/60 hover:border-border focus:bg-background focus:border-primary/30 rounded-xl text-sm transition-all duration-300 shadow-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-6 select-none items-center gap-0.5 rounded-md bg-background border border-border/50 px-2 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <NotificationDropdown />
        <SupportTicketDropdown />

        <div className="h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent mx-2 hidden md:block" />

        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl gap-2 h-9 px-4 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all duration-300"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Store</span>
          </Button>
        </Link>
      </div>
    </header>
  );
};
