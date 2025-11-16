import { apiSlice } from './apiSlice';

export const couponsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public endpoints
    getAvailableCoupons: builder.query({
      query: () => '/coupons/available',
      providesTags: ['Coupon'],
    }),
    
    // Customer endpoints
    validateCoupon: builder.mutation({
      query: (data) => ({
        url: '/coupons/validate',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Admin endpoints
    getCoupons: builder.query({
      query: (params: {
        page?: number;
        per_page?: number;
        is_active?: boolean;
        type?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
      } = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
        return `/coupons?${queryParams.toString()}`;
      },
      providesTags: ['Coupon'],
    }),
    
    getCoupon: builder.query({
      query: (id) => `/coupons/${id}`,
      providesTags: (result, error, id) => [{ type: 'Coupon', id }],
    }),
    
    createCoupon: builder.mutation({
      query: (coupon) => ({
        url: '/coupons',
        method: 'POST',
        body: coupon,
      }),
      invalidatesTags: ['Coupon'],
    }),
    
    updateCoupon: builder.mutation({
      query: ({ id, ...coupon }) => ({
        url: `/coupons/${id}`,
        method: 'PUT',
        body: coupon,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Coupon', id }, 'Coupon'],
    }),
    
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon'],
    }),
    
    toggleCouponStatus: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}/toggle-active`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Coupon', id }, 'Coupon'],
    }),
    
    getCouponStats: builder.query({
      query: (params: { coupon_id?: number } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.coupon_id) {
          queryParams.append('coupon_id', params.coupon_id.toString());
        }
        return `/coupons/stats?${queryParams.toString()}`;
      },
      providesTags: ['Coupon'],
    }),
  }),
});

export const {
  useGetAvailableCouponsQuery,
  useValidateCouponMutation,
  useGetCouponsQuery,
  useGetCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useToggleCouponStatusMutation,
  useGetCouponStatsQuery,
} = couponsApi;
