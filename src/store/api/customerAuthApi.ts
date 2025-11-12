import { apiSlice } from './apiSlice';

export const customerAuthApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation({
      query: (data) => ({
        url: '/customer/send-otp',
        method: 'POST',
        body: data,
      }),
    }),
    registerCustomer: builder.mutation({
      query: (data) => ({
        url: '/customer/register',
        method: 'POST',
        body: data,
      }),
    }),
    loginCustomer: builder.mutation({
      query: (data) => ({
        url: '/customer/login',
        method: 'POST',
        body: data,
      }),
    }),
    updateCustomerProfile: builder.mutation({
      query: (data) => ({
        url: '/customer/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Customer'],
    }),
    logoutCustomer: builder.mutation({
      query: () => ({
        url: '/customer/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useSendOtpMutation,
  useRegisterCustomerMutation,
  useLoginCustomerMutation,
  useUpdateCustomerProfileMutation,
  useLogoutCustomerMutation,
} = customerAuthApi;
