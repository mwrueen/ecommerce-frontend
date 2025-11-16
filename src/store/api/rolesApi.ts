import { apiSlice } from './apiSlice';

export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return `/roles${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Role'],
    }),
    getRole: builder.query({
      query: (id) => `/roles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Role', id }],
    }),
    createRole: builder.mutation({
      query: (data) => ({
        url: '/roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Role'],
    }),
    updateRole: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Role', id }, 'Role'],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),
    assignPermissionsToRole: builder.mutation({
      query: ({ roleId, permissionIds }) => ({
        url: `/roles/${roleId}/permissions`,
        method: 'POST',
        body: { permissions: permissionIds },
      }),
      invalidatesTags: (result, error, { roleId }) => [{ type: 'Role', id: roleId }, 'Role'],
    }),
    removePermissionsFromRole: builder.mutation({
      query: ({ roleId, permissionIds }) => ({
        url: `/roles/${roleId}/permissions`,
        method: 'DELETE',
        body: { permissions: permissionIds },
      }),
      invalidatesTags: (result, error, { roleId }) => [{ type: 'Role', id: roleId }, 'Role'],
    }),
    getRolePermissions: builder.query({
      query: (roleId) => `/roles/${roleId}/permissions`,
      providesTags: (result, error, roleId) => [{ type: 'Role', id: roleId }],
    }),
    getRoleUsers: builder.query({
      query: ({ roleId, ...params }) => {
        const queryString = new URLSearchParams(params).toString();
        return `/roles/${roleId}/users${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result, error, { roleId }) => [{ type: 'Role', id: roleId }],
    }),
    toggleRoleActive: builder.mutation({
      query: (roleId) => ({
        url: `/roles/${roleId}/toggle-active`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, roleId) => [{ type: 'Role', id: roleId }, 'Role'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignPermissionsToRoleMutation,
  useRemovePermissionsFromRoleMutation,
  useGetRolePermissionsQuery,
  useGetRoleUsersQuery,
  useToggleRoleActiveMutation,
} = rolesApi;
