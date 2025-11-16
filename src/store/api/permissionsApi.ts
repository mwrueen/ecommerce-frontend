import { apiSlice } from './apiSlice';

export const permissionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/permissions${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Permission'],
    }),
    getPermission: builder.query({
      query: (id) => `/permissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Permission', id }],
    }),
    getPermissionGroups: builder.query({
      query: () => '/permissions/groups',
      providesTags: ['Permission'],
    }),
    assignPermissionsToUser: builder.mutation({
      query: ({ userId, permissionIds }) => ({
        url: `/users/${userId}/permissions`,
        method: 'POST',
        body: { permission_ids: permissionIds },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }, 'User'],
    }),
    getUserPermissions: builder.query({
      query: (userId) => `/users/${userId}/permissions`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useGetPermissionQuery,
  useGetPermissionGroupsQuery,
  useAssignPermissionsToUserMutation,
  useGetUserPermissionsQuery,
} = permissionsApi;
