import { apiSlice } from './apiSlice';

interface SearchParams {
  query: string;
  type?: 'all' | 'products' | 'categories';
  page?: number;
  per_page?: number;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort_by?: 'relevance' | 'name' | 'price_asc' | 'price_desc' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query({
      query: (params: SearchParams) => {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
        
        return `/search?${queryParams.toString()}`;
      },
      providesTags: ['Search'],
    }),
  }),
});

export const {
  useSearchQuery,
  useLazySearchQuery,
} = searchApi;
