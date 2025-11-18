import { apiSlice } from './apiSlice';

export const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/categories${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Category'],
    }),
    getFeaturedCategories: builder.query({
      query: () => '/categories/featured',
      providesTags: ['Category'],
    }),
    getCategoriesWithProducts: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/categories/with-products${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Category'],
    }),
    getCategory: builder.query({
      query: (identifier) => `/categories/${identifier}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
    toggleFeatured: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}/toggle-featured`,
        method: 'PUT',
      }),
      invalidatesTags: ['Category'],
    }),
    toggleActive: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}/toggle-active`,
        method: 'PUT',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetFeaturedCategoriesQuery,
  useGetCategoriesWithProductsQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleFeaturedMutation,
  useToggleActiveMutation,
} = categoriesApi;
