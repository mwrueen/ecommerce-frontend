import { useGetPublicSettingsQuery } from '@/store/api/siteSettingsApi';

export const AdminFooter = () => {
  const { data: settings } = useGetPublicSettingsQuery({});
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/50 py-3 px-6">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto text-xs text-muted-foreground">
        <span>© {currentYear} {settings?.data?.business_name || 'Admin Panel'}</span>
        <span>v1.0.0</span>
      </div>
    </footer>
  );
};
