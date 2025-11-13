import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, Ban, UserCheck, ShieldAlert, AlertCircle } from 'lucide-react';
import { useGetCustomerQuery, useGetCustomerOrdersQuery, useBanCustomerMutation, useUnbanCustomerMutation, useSuspendCustomerMutation, useUnsuspendCustomerMutation } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [actionDialog, setActionDialog] = useState<{ open: boolean; type: 'ban' | 'suspend' | null }>({
    open: false,
    type: null,
  });
  const [reason, setReason] = useState('');

  const { data: customerData, isLoading, refetch } = useGetCustomerQuery(id);
  const { data: ordersData, isLoading: ordersLoading } = useGetCustomerOrdersQuery({ id: id!, params: {} });
  const [banCustomer, { isLoading: isBanning }] = useBanCustomerMutation();
  const [unbanCustomer, { isLoading: isUnbanning }] = useUnbanCustomerMutation();
  const [suspendCustomer, { isLoading: isSuspending }] = useSuspendCustomerMutation();
  const [unsuspendCustomer, { isLoading: isUnsuspending }] = useUnsuspendCustomerMutation();

  const customer = customerData?.data;
  const orders = ordersData?.orders || [];

  const handleActionDialog = (type: 'ban' | 'suspend') => {
    setActionDialog({ open: true, type });
    setReason('');
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, type: null });
    setReason('');
  };

  const handleConfirmAction = async () => {
    if (!id || !actionDialog.type) return;

    try {
      if (actionDialog.type === 'ban') {
        await banCustomer({ id: parseInt(id), reason }).unwrap();
        toast({ title: 'Success', description: 'Customer banned successfully' });
      } else {
        await suspendCustomer({ id: parseInt(id), reason }).unwrap();
        toast({ title: 'Success', description: 'Customer suspended successfully' });
      }
      closeActionDialog();
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to perform action',
        variant: 'destructive',
      });
    }
  };

  const handleUnban = async () => {
    try {
      await unbanCustomer(parseInt(id!)).unwrap();
      toast({ title: 'Success', description: 'Customer unbanned successfully' });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to unban customer',
        variant: 'destructive',
      });
    }
  };

  const handleUnsuspend = async () => {
    try {
      await unsuspendCustomer(parseInt(id!)).unwrap();
      toast({ title: 'Success', description: 'Customer unsuspended successfully' });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to unsuspend customer',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = () => {
    if (!customer) return null;
    if (customer.is_banned) {
      return <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" />Banned</Badge>;
    }
    if (customer.is_suspended) {
      return <Badge variant="secondary" className="gap-1"><ShieldAlert className="h-3 w-3" />Suspended</Badge>;
    }
    return <Badge variant="outline" className="gap-1"><UserCheck className="h-3 w-3" />Active</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      processing: { variant: 'default', label: 'Processing' },
      shipped: { variant: 'default', label: 'Shipped' },
      delivered: { variant: 'outline', label: 'Delivered' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading customer details...</div>;
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Customer not found</p>
        <Button onClick={() => navigate('/admin/customers')}>Back to Customers</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/customers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Customer Details</h1>
          <p className="text-muted-foreground mt-1">View and manage customer information</p>
        </div>
        <div className="flex gap-2">
          {customer.is_banned ? (
            <Button variant="outline" onClick={handleUnban} disabled={isUnbanning}>
              <UserCheck className="h-4 w-4 mr-2" />
              Unban Customer
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => handleActionDialog('ban')}>
              <Ban className="h-4 w-4 mr-2" />
              Ban Customer
            </Button>
          )}
          {customer.is_suspended ? (
            <Button variant="outline" onClick={handleUnsuspend} disabled={isUnsuspending}>
              <UserCheck className="h-4 w-4 mr-2" />
              Unsuspend Customer
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => handleActionDialog('suspend')} disabled={customer.is_banned}>
              <ShieldAlert className="h-4 w-4 mr-2" />
              Suspend Customer
            </Button>
          )}
        </div>
      </div>

      {(customer.is_banned || customer.is_suspended) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {customer.is_banned && (
              <div>
                <strong>This customer is banned.</strong>
                {customer.ban_reason && <p className="mt-1">Reason: {customer.ban_reason}</p>}
                <p className="text-xs mt-1">Banned on: {new Date(customer.banned_at).toLocaleString()}</p>
              </div>
            )}
            {customer.is_suspended && !customer.is_banned && (
              <div>
                <strong>This customer is suspended.</strong>
                {customer.suspend_reason && <p className="mt-1">Reason: {customer.suspend_reason}</p>}
                <p className="text-xs mt-1">Suspended on: {new Date(customer.suspended_at).toLocaleString()}</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Personal details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-foreground mb-2">{customer.name}</div>
              {getStatusBadge()}
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground">{customer.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-foreground">{customer.address || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-foreground">{new Date(customer.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShoppingBag className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-foreground font-semibold">{customer.orders_count || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Recent orders by this customer</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No orders found</div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: any) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                        <TableCell>{order.order_items?.length || 0}</TableCell>
                        <TableCell className="text-right font-semibold">${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={actionDialog.open} onOpenChange={closeActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'ban' ? 'Ban Customer' : 'Suspend Customer'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'ban'
                ? 'Banned customers cannot add items to cart or place orders. This action can be reversed.'
                : 'Suspended customers cannot add items to cart or place orders. This action can be reversed.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder={`Enter reason for ${actionDialog.type === 'ban' ? 'banning' : 'suspending'} this customer...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">{reason.length}/1000 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog}>
              Cancel
            </Button>
            <Button
              variant={actionDialog.type === 'ban' ? 'destructive' : 'secondary'}
              onClick={handleConfirmAction}
              disabled={isBanning || isSuspending}
            >
              {actionDialog.type === 'ban' ? 'Ban Customer' : 'Suspend Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
