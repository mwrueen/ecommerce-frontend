import { Bell, Package, Trash2, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  useGetUnreadNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '@/store/api/notificationsApi';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: unreadCount } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const { data: notifications } = useGetUnreadNotificationsQuery({
    per_page: 10,
  });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const handleNotificationClick = async (notificationId: string, orderId?: number) => {
    try {
      await markAsRead(notificationId).unwrap();
      if (orderId) {
        navigate(`/admin/orders/${orderId}`);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead().unwrap();
      toast({
        title: 'Success',
        description: `Marked ${result.marked_count} notifications as read`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('Order')) {
      return <Package className="h-4 w-4" />;
    }
    return <Bell className="h-4 w-4" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200">
          <Bell className="h-4 w-4" />
          {unreadCount && unreadCount.unread_count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-rose-500 font-bold"
            >
              {unreadCount.unread_count > 99 ? '99+' : unreadCount.unread_count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-0">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {notifications?.data && notifications.data.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          {!notifications?.data || notifications.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            notifications.data.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-4 cursor-pointer hover:bg-accent"
                onClick={() => handleNotificationClick(notification.id, notification.data.order_id)}
              >
                <div className="mt-1 rounded-full bg-primary/10 p-2">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.data.message}
                  </p>
                  {notification.data.customer_name && (
                    <p className="text-xs text-muted-foreground">
                      From: {notification.data.customer_name}
                    </p>
                  )}
                  {notification.data.total_amount && (
                    <p className="text-xs text-muted-foreground">
                      Amount: ${notification.data.total_amount}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center cursor-pointer"
          onClick={() => navigate('/admin/notifications')}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
