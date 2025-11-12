import { apiSlice } from './apiSlice';

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStockLevel: builder.query({
      query: (productId) => `/inventory/products/${productId}`,
      providesTags: (result, error, productId) => [{ type: 'Product', id: productId }],
    }),
    getBulkStockLevels: builder.query({
      query: (productIds) => ({
        url: '/inventory/products/bulk',
        method: 'POST',
        body: { product_ids: productIds },
      }),
    }),
    checkStockAvailability: builder.query({
      query: ({ productId, quantity }) => 
        `/inventory/products/${productId}/check?quantity=${quantity}`,
    }),
    adjustStock: builder.mutation({
      query: ({ productId, quantity, reason, reference_type, reference_id }) => ({
        url: `/inventory/products/${productId}/adjust`,
        method: 'POST',
        body: { quantity, reason, reference_type, reference_id },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Product',
      ],
    }),
    setStock: builder.mutation({
      query: ({ productId, quantity, reason }) => ({
        url: `/inventory/products/${productId}/set`,
        method: 'PUT',
        body: { quantity, reason },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Product',
      ],
    }),
    reserveStock: builder.mutation({
      query: ({ productId, quantity, order_id }) => ({
        url: `/inventory/products/${productId}/reserve`,
        method: 'POST',
        body: { quantity, order_id },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Product',
      ],
    }),
    releaseStock: builder.mutation({
      query: ({ productId, quantity, order_id }) => ({
        url: `/inventory/products/${productId}/release`,
        method: 'POST',
        body: { quantity, order_id },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Product',
      ],
    }),
    bulkAdjustStock: builder.mutation({
      query: (adjustments) => ({
        url: '/inventory/products/bulk-adjust',
        method: 'POST',
        body: { adjustments },
      }),
      invalidatesTags: ['Product'],
    }),
    getLowStockProducts: builder.query({
      query: (threshold = 10) => `/inventory/low-stock?threshold=${threshold}`,
      providesTags: ['Product'],
    }),
    getOutOfStockProducts: builder.query({
      query: () => '/inventory/out-of-stock',
      providesTags: ['Product'],
    }),
    getInventoryHistory: builder.query({
      query: ({ productId, limit = 50 }) => 
        `/inventory/products/${productId}/history?limit=${limit}`,
    }),
  }),
});

export const {
  useGetStockLevelQuery,
  useGetBulkStockLevelsQuery,
  useLazyCheckStockAvailabilityQuery,
  useAdjustStockMutation,
  useSetStockMutation,
  useReserveStockMutation,
  useReleaseStockMutation,
  useBulkAdjustStockMutation,
  useGetLowStockProductsQuery,
  useGetOutOfStockProductsQuery,
  useGetInventoryHistoryQuery,
} = inventoryApi;
