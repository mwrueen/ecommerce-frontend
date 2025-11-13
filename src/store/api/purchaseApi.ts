import { apiSlice } from './apiSlice';

export interface PurchaseItem {
  product_id: number;
  quantity: number;
}

export interface PurchaseItemDetail {
  product_id: number;
  product_name: string;
  product_sku?: string;
  quantity: number;
  price?: string;
  unit_price?: string;
  total?: string;
  item_total?: string;
  available_stock: number;
}

export interface PurchaseWarning {
  index: number;
  product_id: number;
  product_name: string;
  warning: string;
  available_stock: number;
}

export interface CheckAvailabilityRequest {
  items: PurchaseItem[];
}

export interface CheckAvailabilityResponse {
  success: boolean;
  available: boolean;
  items?: PurchaseItemDetail[];
  warnings?: PurchaseWarning[];
  total_amount?: string;
  error?: string;
}

export interface PurchaseSummaryRequest {
  items: PurchaseItem[];
}

export interface PurchaseSummaryResponse {
  success: boolean;
  summary?: {
    total_items: number;
    total_quantity: number;
    total_amount: string;
    items: PurchaseItemDetail[];
  };
  warnings?: PurchaseWarning[];
  error?: string;
}

export interface ValidatePurchaseRequest {
  items: PurchaseItem[];
}

export interface ValidatePurchaseResponse {
  success: boolean;
  message?: string;
  data?: {
    total_items: number;
    total_quantity: number;
    total_amount: string;
    items: PurchaseItemDetail[];
  };
  warnings?: PurchaseWarning[];
  error?: string;
}

export const purchaseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Public endpoint - Check product availability
    checkAvailability: builder.mutation<CheckAvailabilityResponse, CheckAvailabilityRequest>({
      query: (body) => ({
        url: '/purchase/check-availability',
        method: 'POST',
        body,
      }),
    }),

    // Public/Customer endpoint - Get purchase summary
    getPurchaseSummary: builder.mutation<PurchaseSummaryResponse, PurchaseSummaryRequest>({
      query: (body) => ({
        url: '/purchase/summary',
        method: 'POST',
        body,
      }),
    }),

    // Customer endpoint - Validate purchase items (requires authentication)
    validatePurchase: builder.mutation<ValidatePurchaseResponse, ValidatePurchaseRequest>({
      query: (body) => ({
        url: '/purchase/validate',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useCheckAvailabilityMutation,
  useGetPurchaseSummaryMutation,
  useValidatePurchaseMutation,
} = purchaseApi;
