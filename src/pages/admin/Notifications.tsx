import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  useGetNotificationStatsQuery,
} from '@/store/api/notificationsApi';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: settings } = useGetPublicSettingsQuery({});
  const [activeTab, setActiveTab] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  const { data: allNotifications, isLoading: allLoading } = useGetNotificationsQuery({
    per_page: 50,
  });
  const { data: unreadNotifications, isLoading: unreadLoading } = useGetUnreadNotificationsQuery({
    per_page: 50,
  });
  const { data: stats } = useGetNotificationStatsQuery();
  
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [deleteAllNotifications] = useDeleteAllNotificationsMutation();

  const notifications = activeTab === 'unread' ? unreadNotifications : allNotifications;
  const isLoading = activeTab === 'unread' ? unreadLoading : allLoading;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
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

  const handleDeleteClick = (id: string) => {
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!notificationToDelete) return;

    try {
      await deleteNotification(notificationToDelete).unwrap();
      toast({
        title: 'Success',
        description: 'Notification deleted successfully',
      });
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      const result = await deleteAllNotifications({ read: true }).unwrap();
      toast({
        title: 'Success',
        description: `Deleted ${result.deleted_count} read notifications`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notifications',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationClick = async (id: string, orderId?: number) => {
    await handleMarkAsRead(id);
    if (orderId) {
      navigate(`/admin/orders/${orderId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('Order')) {
      return <Package className="h-5 w-5" />;
    }
    return <Bell className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Manage your notifications and stay updated</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" onClick={handleDeleteAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Read
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.stats.unread}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Read</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{stats.stats.read}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent (7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.recent_7_days}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All
            {allNotifications && (
              <Badge variant="secondary" className="ml-2">
                {allNotifications.pagination?.total || 0}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadNotifications && unreadNotifications.data.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadNotifications.data.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">Loading notifications...</div>
              </CardContent>
            </Card>
          ) : !notifications?.data || notifications.data.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Bell className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            notifications.data.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  !notification.read_at ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <CardHeader
                  className="pb-3"
                  onClick={() => handleNotificationClick(notification.id, notification.data.order_id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full p-3 ${
                        !notification.read_at ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {notification.data.message}
                        </CardTitle>
                        <CardDescription className="space-y-1">
                          {notification.data.customer_name && (
                            <p>From: {notification.data.customer_name}</p>
                          )}
                          {notification.data.total_amount && (
                            <p>Amount: {formatPrice(
                              notification.data.total_amount,
                              settings?.data?.currency_symbol,
                              settings?.data?.currency_position,
                              settings?.data?.formatted_currency
                            )}</p>
                          )}
                          {notification.data.order_number && (
                            <p>Order: {notification.data.order_number}</p>
                          )}
                          <p className="text-xs">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read_at && (
                        <Badge variant="destructive">New</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(notification.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
