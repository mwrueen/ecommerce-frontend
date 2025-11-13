import { apiSlice } from './apiSlice';

interface NotificationData {
  order_id?: number;
  order_number?: string;
  customer_id?: number;
  customer_name?: string;
  total_amount?: string;
  status?: string;
  message?: string;
  created_at?: string;
}

interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  unread_count?: number;
}

interface NotificationDetailResponse {
  success: boolean;
  data: Notification;
}

interface UnreadCountResponse {
  success: boolean;
  unread_count: number;
}

interface NotificationStatsResponse {
  success: boolean;
  stats: {
    total: number;
    unread: number;
    read: number;
    recent_7_days: number;
    by_type: Record<string, number>;
  };
}

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationResponse, {
      read?: boolean;
      type?: string;
      search?: string;
      date_from?: string;
      date_to?: string;
      sort_by?: string;
      sort_order?: string;
      per_page?: number;
      page?: number;
    }>({
      query: (params) => ({
        url: '/notifications',
        params,
      }),
      providesTags: ['Notification'],
    }),
    getUnreadNotifications: builder.query<NotificationResponse, {
      type?: string;
      sort_by?: string;
      sort_order?: string;
      per_page?: number;
      page?: number;
    }>({
      query: (params) => ({
        url: '/notifications/unread',
        params,
      }),
      providesTags: ['Notification'],
    }),
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['Notification'],
    }),
    getNotification: builder.query<NotificationDetailResponse, string>({
      query: (id) => `/notifications/${id}`,
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation<NotificationDetailResponse, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<{ success: boolean; message: string; marked_count: number }, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteAllNotifications: builder.mutation<{ success: boolean; message: string; deleted_count: number }, { read?: boolean }>({
      query: (params) => ({
        url: '/notifications',
        method: 'DELETE',
        params,
      }),
      invalidatesTags: ['Notification'],
    }),
    getNotificationStats: builder.query<NotificationStatsResponse, void>({
      query: () => '/notifications/stats',
      providesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useGetUnreadCountQuery,
  useGetNotificationQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  useGetNotificationStatsQuery,
} = notificationsApi;
