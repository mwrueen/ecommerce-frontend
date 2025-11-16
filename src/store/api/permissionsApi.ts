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
    getGroupedPermissions: builder.query({
      query: () => '/permissions/grouped',
      providesTags: ['Permission'],
    }),
    getPermissionGroups: builder.query({
      query: () => '/permissions/groups',
      providesTags: ['Permission'],
    }),
    createPermission: builder.mutation({
      query: (data) => ({
        url: '/permissions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Permission'],
    }),
    updatePermission: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/permissions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Permission', id }, 'Permission'],
    }),
    deletePermission: builder.mutation({
      query: (id) => ({
        url: `/permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permission'],
    }),
    togglePermissionActive: builder.mutation({
      query: (id) => ({
        url: `/permissions/${id}/toggle-active`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Permission', id }, 'Permission'],
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
  useGetGroupedPermissionsQuery,
  useGetPermissionGroupsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useTogglePermissionActiveMutation,
  useAssignPermissionsToUserMutation,
  useGetUserPermissionsQuery,
} = permissionsApi;
