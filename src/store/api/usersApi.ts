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
        url: `/users/${userId}/role`,
        method: 'POST',
        body: { role_id: roleId },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }, 'User'],
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
} = usersApi;
