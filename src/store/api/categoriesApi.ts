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
    getCategory: builder.query({
      query: (identifier) => `/categories/${identifier}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetFeaturedCategoriesQuery,
  useGetCategoryQuery,
} = categoriesApi;
