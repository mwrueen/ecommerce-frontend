import { apiSlice } from './apiSlice';

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params: { page?: number; per_page?: number } = {}) => {
        const { page = 1, per_page = 12 } = params;
        return `/products?page=${page}&per_page=${per_page}`;
      },
      providesTags: ['Product'],
    }),
    getProduct: builder.query({
      query: (identifier) => `/products/${identifier}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation({
      query: (product) => ({
        url: '/products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...product }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: product,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, 'Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    uploadProductImages: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `/products/${productId}/images`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Product', id: productId }, 'Product'],
    }),
    removeProductImage: builder.mutation({
      query: ({ productId, mediaId }) => ({
        url: `/products/${productId}/images/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Product', id: productId }],
    }),
    setProductThumbnail: builder.mutation({
      query: ({ productId, mediaId }) => ({
        url: `/products/${productId}/images/${mediaId}/thumbnail`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Product', id: productId }],
    }),
    updateImageDetails: builder.mutation({
      query: ({ productId, mediaId, ...data }) => ({
        url: `/products/${productId}/images/${mediaId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Product', id: productId }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImagesMutation,
  useRemoveProductImageMutation,
  useSetProductThumbnailMutation,
  useUpdateImageDetailsMutation,
} = productsApi;
