import { apiSlice } from './apiSlice';

export interface ContactInfo {
  address: string | null;
  email: string | null;
  support_email: string | null;
  contact_number: string | null;
  business_name: string | null;
}

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export const contactApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContactInfo: builder.query<{ success: boolean; data: ContactInfo }, void>({
      query: () => '/contact',
    }),
    submitContactForm: builder.mutation<
      { success: boolean; message: string; data: any },
      ContactSubmission
    >({
      query: (data) => ({
        url: '/contact',
        method: 'POST',
        body: data,
      }),
    }),
    getContacts: builder.query<{ success: boolean; data: Contact[] }, { status?: string }>({
      query: (params) => ({
        url: '/admin/contacts',
        params,
      }),
      providesTags: ['Contacts'],
    }),
    getContactById: builder.query<{ success: boolean; data: Contact }, number>({
      query: (id) => `/admin/contacts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Contacts', id }],
    }),
    updateContactStatus: builder.mutation<
      { success: boolean; data: Contact },
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/admin/contacts/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Contacts', id }, 'Contacts'],
    }),
    deleteContact: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/admin/contacts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contacts'],
    }),
  }),
});

export const {
  useGetContactInfoQuery,
  useSubmitContactFormMutation,
  useGetContactsQuery,
  useGetContactByIdQuery,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
} = contactApi;
