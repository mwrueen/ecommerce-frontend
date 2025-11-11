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
      query: (data) => ({
        url: '/site-settings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SiteSettings'],
    }),
  }),
});

export const { 
  useGetPublicSettingsQuery, 
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation 
} = siteSettingsApi;
