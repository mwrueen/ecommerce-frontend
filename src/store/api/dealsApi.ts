import { apiSlice } from './apiSlice';

export interface Deal {
  id: number;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  type: 'product' | 'category' | 'flash' | 'buy_x_get_y' | 'minimum_purchase';
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  original_price?: string;
  deal_price?: string;
  minimum_purchase_amount?: string;
  maximum_discount?: string;
  applicable_products?: number[];
  applicable_categories?: number[];
  buy_quantity?: number;
  get_quantity?: number;
  get_product_id?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
  priority: number;
  image_url?: string;
  banner_image_url?: string;
  usage_limit?: number;
  usage_count: number;
  usage_limit_per_customer?: number;
  is_valid: boolean;
  time_remaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
    total_seconds: number;
  };
  discount_percentage?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  updater?: {
    id: number;
    name: string;
    email: string;
  };
  products_details?: {
    id: number;
    name: string;
    sku: string;
  }[];
  categories_details?: {
    id: number;
    name: string;
  }[];
  categories?: {
    id: number;
    name: string;
    slug: string;
  }[];
  products?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

export interface DealFormData {
  title: string;
  slug?: string;
  description?: string;
  short_description?: string;
  type: string;
  discount_type: string;
  discount_value: number;
  original_price?: number;
  deal_price?: number;
  minimum_purchase_amount?: number;
  maximum_discount?: number;
  applicable_products?: number[];
  applicable_categories?: number[];
  buy_quantity?: number;
  get_quantity?: number;
  get_product_id?: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  is_featured?: boolean;
  priority?: number;
  image_url?: string;
  banner_image_url?: string;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface ValidateDealRequest {
  deal_id: number;
  items: {
    product_id: number;
    quantity: number;
  }[];
}

export const dealsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public endpoints
    getDeals: builder.query<{ success: boolean; data: Deal[]; pagination: any }, {
      type?: string;
      featured?: boolean;
      product_id?: number;
      category_id?: number;
      sort_by?: string;
      sort_order?: string;
      per_page?: number;
      page?: number;
    }>({
      query: (params) => ({
        url: '/deals',
        params,
      }),
      providesTags: ['Deal'],
    }),

    getFeaturedDeals: builder.query<{ success: boolean; data: Deal[] }, { limit?: number }>({
      query: (params) => ({
        url: '/deals/featured',
        params,
      }),
      providesTags: ['Deal'],
    }),

    getFlashDeals: builder.query<{ success: boolean; data: Deal[]; pagination: any }, {
      per_page?: number;
      page?: number;
    }>({
      query: (params) => ({
        url: '/deals/flash',
        params,
      }),
      providesTags: ['Deal'],
    }),

    getDeal: builder.query<{ success: boolean; data: Deal }, string | number>({
      query: (identifier) => `/deals/${identifier}`,
      providesTags: ['Deal'],
    }),

    getDealsForProduct: builder.query<{ success: boolean; data: Deal[] }, number>({
      query: (productId) => `/deals/product/${productId}`,
      providesTags: ['Deal'],
    }),

    getAdminDeal: builder.query<{ success: boolean; data: Deal }, string | number>({
      query: (id) => `/admin/deals/${id}`,
      providesTags: ['Deal'],
    }),

    getDealsForCategory: builder.query<{ success: boolean; data: Deal[] }, number>({
      query: (categoryId) => `/deals/category/${categoryId}`,
      providesTags: ['Deal'],
    }),

    // Customer endpoints
    validateDeal: builder.mutation<any, ValidateDealRequest>({
      query: (data) => ({
        url: '/deals/validate',
        method: 'POST',
        body: data,
      }),
    }),

    // Admin endpoints
    getAllDeals: builder.query<{ success: boolean; data: Deal[]; pagination: any }, {
      is_active?: boolean;
      is_featured?: boolean;
      type?: string;
      valid_only?: boolean;
      search?: string;
      sort_by?: string;
      sort_order?: string;
      per_page?: number;
      page?: number;
    }>({
      query: (params) => ({
        url: '/admin/deals',
        params,
      }),
      providesTags: ['Deal'],
    }),

    createDeal: builder.mutation<{ success: boolean; message: string; data: Deal }, DealFormData | FormData>({
      query: (data) => ({
        url: '/admin/deals',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Deal'],
    }),

    updateDeal: builder.mutation<{ success: boolean; message: string; data: Deal }, { id: number; data: Partial<DealFormData> | FormData }>({
      query: ({ id, data }) => ({
        url: `/admin/deals/${id}`,
        method: 'POST', // Use POST for multipart form update (with _method: PUT)
        body: data,
      }),
      invalidatesTags: ['Deal'],
    }),

    deleteDeal: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/admin/deals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Deal'],
    }),

    toggleDealActive: builder.mutation<{ success: boolean; message: string; data: Deal }, number>({
      query: (id) => ({
        url: `/admin/deals/${id}/toggle-active`,
        method: 'POST',
      }),
      invalidatesTags: ['Deal'],
    }),

    toggleDealFeatured: builder.mutation<{ success: boolean; message: string; data: Deal }, number>({
      query: (id) => ({
        url: `/admin/deals/${id}/toggle-featured`,
        method: 'POST',
      }),
      invalidatesTags: ['Deal'],
    }),

    getDealStats: builder.query<{ success: boolean; data: any }, { deal_id?: number }>({
      query: (params) => ({
        url: '/admin/deals/stats',
        params,
      }),
    }),
  }),
});

export const {
  useGetDealsQuery,
  useGetFeaturedDealsQuery,
  useGetFlashDealsQuery,
  useGetDealQuery,
  useGetDealsForProductQuery,
  useGetDealsForCategoryQuery,
  useValidateDealMutation,
  useGetAllDealsQuery,
  useGetAdminDealQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useDeleteDealMutation,
  useToggleDealActiveMutation,
  useToggleDealFeaturedMutation,
  useGetDealStatsQuery,
} = dealsApi;
