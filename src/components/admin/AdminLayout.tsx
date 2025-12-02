import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminFooter } from './AdminFooter';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

export const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const { data: settingsData } = useGetPublicSettingsQuery({});
  const settings = settingsData?.data;

  useEffect(() => {
    if (settings?.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings?.favicon]);

  return (
    <>
      <Helmet>
        <title>{settings?.meta_title || settings?.title || ''} - Admin</title>
      </Helmet>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <AdminHeader />
            <main className={cn(
              "flex-1 overflow-y-auto",
              "bg-gradient-to-b from-transparent via-background/30 to-background/60"
            )}>
              <div className="p-6 lg:p-8">
                <div className="mx-auto max-w-[1400px] w-full">
                  {children || <Outlet />}
                </div>
              </div>
            </main>
            <AdminFooter />
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};
