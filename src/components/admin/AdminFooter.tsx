import { Mail, MapPin } from 'lucide-react';
import { useGetPublicSettingsQuery } from '@/store/api/siteSettingsApi';

export const AdminFooter = () => {
  const { data: settings } = useGetPublicSettingsQuery({});
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-admin-header-border bg-admin-header/50 backdrop-blur-sm py-4 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
          {settings?.data?.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-admin-header-foreground/70" />
              <a 
                href={`mailto:${settings.data.email}`}
                className="text-admin-header-foreground/80 hover:text-admin-header-foreground transition-colors"
              >
                {settings.data.email}
              </a>
            </div>
          )}
          {settings?.data?.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-admin-header-foreground/70" />
              <span className="text-admin-header-foreground/80">{settings.data.address}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-admin-header-foreground/60">
          © {currentYear} {settings?.data?.business_name || 'Admin Panel'}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
