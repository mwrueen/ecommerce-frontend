import { Helmet } from 'react-helmet';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  price?: number | string;
  currency?: string;
  availability?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  noindex?: boolean;
}

export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  price,
  currency,
  availability,
  jsonLd,
  noindex = false,
}: SEOProps) {
  const { data: settingsData } = useGetPublicSettingsQuery({});
  const settings = settingsData?.data;

  const siteTitle = settings?.meta_title || settings?.title || 'eCommerce Store';
  const siteDescription = settings?.meta_description || 'Discover top deals and shop high quality products online.';
  const siteKeywords = settings?.meta_keywords || 'ecommerce, online shopping, flash deals, discount products';
  const defaultImage = settings?.header_logo || `${window.location.origin}/placeholder.svg`;

  const finalTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const finalDescription = description || siteDescription;
  const finalKeywords = keywords ? `${keywords}, ${siteKeywords}` : siteKeywords;
  const finalCanonical = canonicalUrl || window.location.href.split('?')[0];
  const finalImage = ogImage || defaultImage;
  const finalCurrency = currency || settings?.currency || 'USD';

  // Standardize JSON-LD scripts into array format
  const jsonLdScripts = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph Meta Tags */}
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalCanonical} />
      {finalImage && <meta property="og:image" content={finalImage} />}
      {price !== undefined && <meta property="product:price:amount" content={String(price)} />}
      {price !== undefined && <meta property="product:price:currency" content={finalCurrency} />}
      {availability && <meta property="product:availability" content={availability} />}

      {/* Twitter Cards Meta Tags */}
      <meta name="twitter:card" content={finalImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {finalImage && <meta name="twitter:image" content={finalImage} />}

      {/* JSON-LD Structured Data */}
      {jsonLdScripts.map((data, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
