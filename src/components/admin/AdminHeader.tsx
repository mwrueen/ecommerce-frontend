import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetPublicSettingsQuery } from '@/store/api/siteSettingsApi';

export const AdminHeader = () => {
  const { data: settings } = useGetPublicSettingsQuery({});

  return (
    <header className="h-20 border-b border-admin-header-border bg-admin-header shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <SidebarTrigger className="text-admin-header-foreground" />
        {settings?.data?.header_logo && (
          <img 
            src={settings.data.header_logo} 
            alt={settings.data.business_name || 'Logo'} 
            className="h-12 object-contain"
          />
        )}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-admin-header-foreground">
            {settings?.data?.business_name || 'Admin Dashboard'}
          </h1>
          {settings?.data?.tagline && (
            <p className="text-xs text-admin-header-foreground/70">{settings.data.tagline}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-sm border-r border-admin-header-border pr-6">
          {settings?.data?.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-admin-header-foreground/70" />
              <span className="text-admin-header-foreground/80">{settings.data.email}</span>
            </div>
          )}
          {settings?.data?.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-admin-header-foreground/70" />
              <span className="text-admin-header-foreground/80">{settings.data.address}</span>
            </div>
          )}
        </div>
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-admin-header-foreground hover:bg-admin-header-foreground/10">
            <Home className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
        </Link>
      </div>
    </header>
  );
};
