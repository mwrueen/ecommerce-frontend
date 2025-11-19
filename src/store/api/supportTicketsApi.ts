import { apiSlice } from './apiSlice';

export interface SupportTicket {
  id: number;
  ticket_number: string;
  customer_id: number;
  assigned_to: number | null;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'order' | 'product' | 'account' | 'other';
  resolved_at: string | null;
  closed_at: string | null;
  last_replied_at: string | null;
  last_replied_by: number | null;
  message_count: number;
  is_customer_read: boolean;
  is_admin_read: boolean;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  assigned_admin?: {
    id: number;
    name: string;
    email: string;
  };
  last_replied_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  latest_message?: SupportMessage;
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: number;
  ticket_id: number;
  customer_id: number | null;
  admin_id: number | null;
  message: string;
  sender_type: 'customer' | 'admin';
  is_read: boolean;
  read_at: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at?: string;
  customer?: {
    id: number;
    name: string;
    email: string;
  };
  admin?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'technical' | 'billing' | 'order' | 'product' | 'account' | 'other';
}

export interface SendMessageRequest {
  message: string;
  attachments?: string[];
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  customer_id?: number;
  assigned_to?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export const supportTicketsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Customer Endpoints
    createSupportTicket: builder.mutation<{ success: boolean; message: string; ticket: SupportTicket }, CreateTicketRequest>({
      query: (data) => ({
        url: '/support-tickets',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    getCustomerTickets: builder.query<{ success: boolean; data: SupportTicket[]; pagination: any }, TicketFilters>({
      query: (params) => ({
        url: '/support-tickets',
        params,
      }),
      providesTags: ['SupportTicket'],
    }),

    getSupportTicket: builder.query<{ success: boolean; ticket: SupportTicket }, number>({
      query: (id) => `/support-tickets/${id}`,
      providesTags: ['SupportTicket'],
    }),

    // Admin Endpoints
    getAllSupportTickets: builder.query<{ success: boolean; data: SupportTicket[]; pagination: any }, TicketFilters>({
      query: (params) => ({
        url: '/support-tickets',
        params,
      }),
      providesTags: ['SupportTicket'],
    }),

    updateTicketStatus: builder.mutation<{ success: boolean; message: string; ticket: SupportTicket }, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/support-tickets/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    assignTicket: builder.mutation<{ success: boolean; message: string; ticket: SupportTicket }, { id: number; admin_id: number }>({
      query: ({ id, admin_id }) => ({
        url: `/support-tickets/${id}/assign`,
        method: 'POST',
        body: { admin_id },
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    updateTicketPriority: builder.mutation<{ success: boolean; message: string; ticket: SupportTicket }, { id: number; priority: string }>({
      query: ({ id, priority }) => ({
        url: `/support-tickets/${id}/priority`,
        method: 'PUT',
        body: { priority },
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    getSupportTicketStats: builder.query<{ success: boolean; data: any }, { date_from?: string; date_to?: string }>({
      query: (params) => ({
        url: '/support-tickets/stats',
        params,
      }),
    }),

    deleteSupportTicket: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/support-tickets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    // Message Endpoints
    getTicketMessages: builder.query<{ success: boolean; data: SupportMessage[]; ticket: any }, number>({
      query: (ticketId) => `/support-tickets/${ticketId}/messages`,
      providesTags: ['SupportTicket'],
    }),

    sendMessage: builder.mutation<{ success: boolean; message: string; data: SupportMessage }, { ticketId: number; data: SendMessageRequest }>({
      query: ({ ticketId, data }) => ({
        url: `/support-tickets/${ticketId}/messages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    markMessageAsRead: builder.mutation<{ success: boolean; message: string }, number>({
      query: (messageId) => ({
        url: `/support-messages/${messageId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['SupportTicket'],
    }),
  }),
});

export const {
  useCreateSupportTicketMutation,
  useGetCustomerTicketsQuery,
  useGetSupportTicketQuery,
  useGetAllSupportTicketsQuery,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  useUpdateTicketPriorityMutation,
  useGetSupportTicketStatsQuery,
  useDeleteSupportTicketMutation,
  useGetTicketMessagesQuery,
  useSendMessageMutation,
  useMarkMessageAsReadMutation,
} = supportTicketsApi;
