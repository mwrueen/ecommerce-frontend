import { apiSlice } from './apiSlice';

export const siteSettingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicSettings: builder.query({
      query: () => '/site-settings/public',
      providesTags: ['SiteSettings'],
    }),
  }),
});

export const { useGetPublicSettingsQuery } = siteSettingsApi;
