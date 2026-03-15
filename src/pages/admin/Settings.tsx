import { useState } from 'react';
import { useGetSiteSettingsQuery } from '@/hooks/useApi';
import { Loader2, Store, Sparkles, Mail, ShoppingBag, Clock, Share2, Search, ShieldAlert, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import split settings components
import GeneralSettings from './settings/GeneralSettings';
import BrandingSettings from './settings/BrandingSettings';
import ContactSettings from './settings/ContactSettings';
import EcommerceSettings from './settings/EcommerceSettings';
import BusinessSettings from './settings/BusinessSettings';
import SocialSettings from './settings/SocialSettings';
import SeoSettings from './settings/SeoSettings';
import LegalSettings from './settings/LegalSettings';

const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: Store, color: 'text-primary' },
  { id: 'branding', label: 'Branding', icon: Sparkles, color: 'text-purple-600' },
  { id: 'contact', label: 'Contact', icon: Mail, color: 'text-blue-600' },
  { id: 'ecommerce', label: 'Ecommerce', icon: ShoppingBag, color: 'text-emerald-600' },
  { id: 'business', label: 'Business', icon: Clock, color: 'text-indigo-600' },
  { id: 'social', label: 'Social', icon: Share2, color: 'text-teal-600' },
  { id: 'seo', label: 'SEO', icon: Search, color: 'text-orange-600' },
  { id: 'legal', label: 'Legal', icon: ShieldAlert, color: 'text-red-600' },
];

export default function Settings() {
  const { data: settingsData, isLoading } = useGetSiteSettingsQuery({});
  const [activeTab, setActiveTab] = useState('general');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
        </div>
        <p className="text-muted-foreground animate-pulse font-medium">Loading store configuration...</p>
      </div>
    );
  }

  const settings = settingsData?.data || {};

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings settings={settings} />;
      case 'branding': return <BrandingSettings settings={settings} />;
      case 'contact': return <ContactSettings settings={settings} />;
      case 'ecommerce': return <EcommerceSettings settings={settings} />;
      case 'business': return <BusinessSettings settings={settings} />;
      case 'social': return <SocialSettings settings={settings} />;
      case 'seo': return <SeoSettings settings={settings} />;
      case 'legal': return <LegalSettings settings={settings} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <LayoutGrid className="h-8 w-8 text-primary" />
            Control Center
          </h2>
          <p className="text-slate-500 font-medium">Global configuration and platform management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-3xl p-4 sticky top-24 shadow-sm">
          <nav className="space-y-1.5">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative",
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/25 translate-x-1"
                    : "text-slate-600 hover:bg-white hover:shadow-sm hover:translate-x-1"
                )}
              >
                <tab.icon className={cn(
                  "h-5 w-5 transition-colors",
                  activeTab === tab.id ? "text-white" : tab.color
                )} />
                <span className="font-semibold text-sm">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Dynamic Content Area */}
        <main className="min-h-[600px]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
