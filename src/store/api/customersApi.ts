import { apiSlice } from './apiSlice';

export const customersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/customers${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Customer'],
    }),
    getCustomer: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),
    searchCustomers: builder.query({
      query: (query) => `/customers-search?query=${encodeURIComponent(query)}`,
      providesTags: ['Customer'],
    }),
    banCustomer: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/customers/${id}/ban`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),
    unbanCustomer: builder.mutation({
      query: (id) => ({
        url: `/customers/${id}/unban`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Customer', id }, 'Customer'],
    }),
    suspendCustomer: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/customers/${id}/suspend`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),
    unsuspendCustomer: builder.mutation({
      query: (id) => ({
        url: `/customers/${id}/unsuspend`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Customer', id }, 'Customer'],
    }),
    getCustomerOrders: builder.query({
      query: ({ id, params = {} }) => {
        const queryString = new URLSearchParams(params).toString();
        return `/customers/${id}/orders${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Order'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useSearchCustomersQuery,
  useBanCustomerMutation,
  useUnbanCustomerMutation,
  useSuspendCustomerMutation,
  useUnsuspendCustomerMutation,
  useGetCustomerOrdersQuery,
} = customersApi;
