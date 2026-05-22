import { apiSlice } from './apiSlice';

export interface HeroSection {
  title: string;
  tagline: string;
  description: string;
  slider_images: SliderImage[];
  mockup?: {
    badge?: string;
    product_name?: string;
    product_description?: string;
    price?: string;
    discount?: string;
    rating?: string;
    happy_users?: string;
    link?: string;
  } | null;
  bg_type?: string;
  bg_color?: string;
  bg_image?: string | null;
}

export interface SliderImage {
  image: string;
  title: string;
  subtitle: string;
  hyperlink: string;
}

export interface SiteInfo {
  store_enabled: boolean;
  store_mode: string;
  currency: string;
  currency_symbol: string;
  formatted_currency: string;
  free_shipping_threshold: number;
  shipping_cost: number;
}

export interface LandingPageCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  active_products_count: number;
  children?: LandingPageCategory[];
}

export interface LandingPageProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock_quantity: number;
  sku: string;
  image_url: string;
  in_stock: boolean;
  total_sold?: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  media: Array<{
    id: number;
    url: string;
    type: string;
    is_thumbnail: boolean;
  }>;
}

export interface LandingPageDeal {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  type: string;
  discount_type: string;
  discount_value: string;
  discount_percentage?: number;
  original_price?: string;
  deal_price?: string;
  image_url?: string;
  banner_image_url?: string;
  start_date?: string;
  end_date: string;
  time_remaining?: string;
  is_valid: boolean;
}

export interface LandingPageData {
  hero_section: HeroSection;
  site_info: SiteInfo;
  featured_categories: LandingPageCategory[];
  latest_products: LandingPageProduct[];
  top_selling_products: LandingPageProduct[];
  featured_deals: LandingPageDeal[];
  flash_deals: LandingPageDeal[];
}

export interface LandingPageResponse {
  success: boolean;
  message?: string;
  data: LandingPageData;
  error?: string;
}

export const landingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all landing page data
    getLandingPageData: builder.query<LandingPageResponse, void>({
      query: () => '/landing',
      providesTags: ['Product', 'Category', 'Deal', 'SiteSettings'],
    }),

    // Get hero section only
    getHeroSection: builder.query<{ success: boolean; data: HeroSection }, void>({
      query: () => '/landing/hero',
      providesTags: ['SiteSettings'],
    }),

    // Get featured products
    getFeaturedProducts: builder.query<
      { success: boolean; data: LandingPageProduct[] },
      { limit?: number }
    >({
      query: (params) => ({
        url: '/landing/featured-products',
        params: params.limit ? { limit: params.limit.toString() } : undefined,
      }),
      providesTags: ['Product'],
    }),

    // Get top selling products
    getTopSellingProducts: builder.query<
      { success: boolean; data: LandingPageProduct[] },
      { limit?: number }
    >({
      query: (params) => ({
        url: '/landing/top-selling-products',
        params: params.limit ? { limit: params.limit.toString() } : undefined,
      }),
      providesTags: ['Product'],
    }),
  }),
});

export const {
  useGetLandingPageDataQuery,
  useGetHeroSectionQuery,
  useGetFeaturedProductsQuery,
  useGetTopSellingProductsQuery,
} = landingApi;

