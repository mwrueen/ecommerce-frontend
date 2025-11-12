import { apiSlice } from './apiSlice';

export const siteSettingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicSettings: builder.query({
      query: () => '/site-settings/public',
      providesTags: ['SiteSettings'],
    }),
    getSiteSettings: builder.query({
      query: () => '/site-settings',
      providesTags: ['SiteSettings'],
    }),
    updateSiteSettings: builder.mutation({
      query: (data) => {
        // Check if data is FormData (for file uploads)
        const isFormData = data instanceof FormData;
        
        return {
          url: '/site-settings',
          method: 'POST',
          body: data,
          // Don't set Content-Type header for FormData - browser will set it with boundary
          headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['SiteSettings'],
    }),
  }),
});

export const { 
  useGetPublicSettingsQuery, 
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation 
} = siteSettingsApi;
