import { apiSlice } from './apiSlice';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (params) => ({
        url: '/dashboard/stats',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
    getSalesTrends: builder.query({
      query: (params) => ({
        url: '/dashboard/sales-trends',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
    getTopProducts: builder.query({
      query: (params) => ({
        url: '/dashboard/top-products',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
    getTopCustomers: builder.query({
      query: (params) => ({
        url: '/dashboard/top-customers',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
    getRecentOrders: builder.query({
      query: (params) => ({
        url: '/dashboard/recent-orders',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
    getLowStockAlerts: builder.query({
      query: (params) => ({
        url: '/dashboard/low-stock-alerts',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
    getCategorySales: builder.query({
      query: (params) => ({
        url: '/dashboard/category-sales',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetSalesTrendsQuery,
  useGetTopProductsQuery,
  useGetTopCustomersQuery,
  useGetRecentOrdersQuery,
  useGetLowStockAlertsQuery,
  useGetCategorySalesQuery,
} = dashboardApi;
