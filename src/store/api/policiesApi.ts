import { apiSlice } from './apiSlice';

export const policiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTermsOfService: builder.query({
      query: () => '/policies/terms-of-service',
    }),
    getPrivacyPolicy: builder.query({
      query: () => '/policies/privacy-policy',
    }),
    getReturnPolicy: builder.query({
      query: () => '/policies/return-policy',
    }),
    getShippingPolicy: builder.query({
      query: () => '/policies/shipping-policy',
    }),
  }),
});

export const {
  useGetTermsOfServiceQuery,
  useGetPrivacyPolicyQuery,
  useGetReturnPolicyQuery,
  useGetShippingPolicyQuery,
} = policiesApi;
