import { apiSlice } from './apiSlice';

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/users${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['User'],
    }),
    getUser: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    banUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/ban`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
    }),
    unbanUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/unban`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
    }),
    getUserStats: builder.query({
      query: () => '/users-stats',
    }),
    assignRoleToUser: builder.mutation({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}/assign-role`,
        method: 'POST',
        body: { role_id: roleId },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }, 'User'],
    }),
    changeUserRole: builder.mutation({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}/change-role`,
        method: 'PUT',
        body: { role_id: roleId },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }, 'User'],
    }),
    updateUserPassword: builder.mutation({
      query: ({ userId, password, password_confirmation }) => ({
        url: `/users/${userId}/password`,
        method: 'PUT',
        body: { password, password_confirmation },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),
    getProfile: builder.query({
      query: () => '/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateProfilePassword: builder.mutation({
      query: ({ current_password, password, password_confirmation }) => ({
        url: '/profile/password',
        method: 'PUT',
        body: { current_password, password, password_confirmation },
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBanUserMutation,
  useUnbanUserMutation,
  useGetUserStatsQuery,
  useAssignRoleToUserMutation,
  useChangeUserRoleMutation,
  useUpdateUserPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateProfilePasswordMutation,
} = usersApi;
