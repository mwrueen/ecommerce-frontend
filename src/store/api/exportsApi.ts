import { apiSlice } from './apiSlice';

export const exportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    exportOrders: builder.mutation({
      query: (params) => ({
        url: '/exports/orders',
        params,
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return { success: true };
        },
      }),
    }),
    exportProducts: builder.mutation({
      query: (params) => ({
        url: '/exports/products',
        params,
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return { success: true };
        },
      }),
    }),
    exportCustomers: builder.mutation({
      query: (params) => ({
        url: '/exports/customers',
        params,
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return { success: true };
        },
      }),
    }),
    exportSalesReport: builder.mutation({
      query: (params) => ({
        url: '/exports/sales-report',
        params,
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return { success: true };
        },
      }),
    }),
    exportProductSalesReport: builder.mutation({
      query: (params) => ({
        url: '/exports/product-sales-report',
        params,
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `product_sales_report_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return { success: true };
        },
      }),
    }),
  }),
});

export const {
  useExportOrdersMutation,
  useExportProductsMutation,
  useExportCustomersMutation,
  useExportSalesReportMutation,
  useExportProductSalesReportMutation,
} = exportsApi;
