import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from './Header';
import Footer from './Footer';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';

const Layout = () => {
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
        <title>{settings?.meta_title || settings?.title || 'ShopHub'}</title>
        <meta name="description" content={settings?.meta_description || 'Shop the best products online'} />
        <meta name="keywords" content={settings?.meta_keywords || 'ecommerce, online shopping, products'} />
        {settings?.google_analytics_id && (
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`}></script>
        )}
        {settings?.google_analytics_id && (
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.google_analytics_id}');
            `}
          </script>
        )}
        {settings?.facebook_pixel_id && (
          <script>
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${settings.facebook_pixel_id}');
              fbq('track', 'PageView');
            `}
          </script>
        )}
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
