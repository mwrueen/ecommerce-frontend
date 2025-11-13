import { apiSlice } from './apiSlice';

// Request/Response Types
export interface RecordPurchaseRequest {
  product_id: number;
  quantity: number;
  purchase_price?: number;
  supplier_name?: string;
  purchase_order_number?: string;
  reason?: string;
}

export interface PurchaseResult {
  product_id: number;
  product_name: string;
  product_sku?: string;
  purchase_quantity: number;
  old_stock: number;
  new_stock: number;
  purchase_price?: string;
  supplier_name?: string;
  purchase_order_number?: string;
}

export interface RecordPurchaseResponse {
  success: boolean;
  message: string;
  purchase: PurchaseResult;
  product: {
    id: number;
    name: string;
    sku?: string;
    stock_quantity: number;
    is_active: boolean;
  };
}

export interface BulkPurchaseRequest {
  purchases: RecordPurchaseRequest[];
}

export interface BulkPurchaseResult {
  index: number;
  success: boolean;
  purchase?: PurchaseResult;
  error?: string;
  product_id?: number;
}

export interface BulkPurchaseResponse {
  success: boolean;
  message: string;
  total_purchases?: number;
  results: BulkPurchaseResult[];
  errors?: BulkPurchaseResult[];
}

export interface InventoryHistoryRecord {
  id: number;
  product_id: number;
  old_quantity: number;
  new_quantity: number;
  adjustment: number;
  reason: string;
  reference_type: string;
  reference_id: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  product?: {
    id: number;
    name: string;
    sku?: string;
  };
}

export interface ProductPurchaseHistoryResponse {
  success: boolean;
  product_id: number;
  total_records: number;
  history: InventoryHistoryRecord[];
}

export interface PurchaseHistoryResponse {
  success: boolean;
  data: InventoryHistoryRecord[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PurchaseStatsResponse {
  success: boolean;
  stats: {
    total_purchases: number;
    total_quantity_purchased: number;
    top_purchased_products: Array<{
      product_id: number;
      total_purchased: number;
      product: {
        id: number;
        name: string;
        sku?: string;
        stock_quantity: number;
      };
    }>;
  };
}

export const adminPurchasesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Record single product purchase
    recordPurchase: builder.mutation<RecordPurchaseResponse, RecordPurchaseRequest>({
      query: (body) => ({
        url: '/admin-purchases',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),

    // Record bulk product purchases
    recordBulkPurchases: builder.mutation<BulkPurchaseResponse, BulkPurchaseRequest>({
      query: (body) => ({
        url: '/admin-purchases/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),

    // Get product purchase history
    getProductPurchaseHistory: builder.query<ProductPurchaseHistoryResponse, { productId: number; limit?: number }>({
      query: ({ productId, limit = 50 }) => ({
        url: `/admin-purchases/products/${productId}/history`,
        params: { limit },
      }),
    }),

    // Get all purchase history with filters
    getPurchaseHistory: builder.query<
      PurchaseHistoryResponse,
      {
        product_id?: number;
        date_from?: string;
        date_to?: string;
        admin_id?: number;
        per_page?: number;
        page?: number;
      }
    >({
      query: (params) => ({
        url: '/admin-purchases/history',
        params,
      }),
    }),

    // Get purchase statistics
    getPurchaseStats: builder.query<PurchaseStatsResponse, { date_from?: string; date_to?: string }>({
      query: (params) => ({
        url: '/admin-purchases/stats',
        params,
      }),
    }),
  }),
});

export const {
  useRecordPurchaseMutation,
  useRecordBulkPurchasesMutation,
  useGetProductPurchaseHistoryQuery,
  useGetPurchaseHistoryQuery,
  useGetPurchaseStatsQuery,
} = adminPurchasesApi;
