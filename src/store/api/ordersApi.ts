import { apiSlice } from './apiSlice';

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (params: { 
        page?: number; 
        per_page?: number;
        status?: string;
        customer_id?: number;
        search?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_order?: string;
      } = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
        return `/orders?${queryParams.toString()}`;
      },
      providesTags: ['Order'],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: order,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),
    getOrderStats: builder.query({
      query: (params: { date_from?: string; date_to?: string } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.date_from) queryParams.append('date_from', params.date_from);
        if (params.date_to) queryParams.append('date_to', params.date_to);
        return `/orders/stats?${queryParams.toString()}`;
      },
      providesTags: ['Order'],
    }),
    // Customer cancellation endpoints
    requestOrderCancellation: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/request-cancellation`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),
    cancelOrder: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),
    // Admin cancellation endpoints
    getPendingCancellations: builder.query({
      query: (params: {
        customer_id?: number;
        search?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_order?: string;
        per_page?: number;
        page?: number;
      } = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
        return `/orders/pending-cancellations?${queryParams.toString()}`;
      },
      providesTags: ['Order'],
    }),
    approveCancellation: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/approve-cancellation`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }, 'Order'],
    }),
    rejectCancellation: builder.mutation({
      query: ({ id, admin_note }) => ({
        url: `/orders/${id}/reject-cancellation`,
        method: 'POST',
        body: { admin_note },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useGetOrderStatsQuery,
  useRequestOrderCancellationMutation,
  useCancelOrderMutation,
  useGetPendingCancellationsQuery,
  useApproveCancellationMutation,
  useRejectCancellationMutation,
} = ordersApi;
