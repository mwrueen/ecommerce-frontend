import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderQuery, useUpdateOrderStatusMutation, useDeleteOrderMutation, useCancelOrderMutation } from '@/store/api/ordersApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Trash2, Package, User, MapPin, Calendar, XCircle, Clock, AlertCircle, Truck, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { CancelOrderDialog } from '@/components/CancelOrderDialog';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: orderData, isLoading } = useGetOrderQuery(id);
  const { data: settings } = useGetPublicSettingsQuery({});
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const order = orderData?.order;

  const canAdminCancel = order?.status === 'pending' || order?.status === 'processing';
  const hasPendingCancellationRequest = !!order?.cancellation_requested_at && order?.status !== 'cancelled';

  // Define valid status transitions based on current status
  const getValidNextStatuses = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [], // Final state
      cancelled: [], // Final state
    };
    return transitions[currentStatus] || [];
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    try {
      await updateStatus({ id: parseInt(id!), status: selectedStatus }).unwrap();
      toast.success(`Order status updated to ${selectedStatus}`);
      setShowStatusDialog(false);
      setSelectedStatus(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update order status');
    }
  };

  const initiateStatusUpdate = (status: string) => {
    if (status === 'cancelled') {
      setShowCancelDialog(true);
    } else {
      setSelectedStatus(status);
      setShowStatusDialog(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(parseInt(id!)).unwrap();
      toast.success('Order deleted successfully');
      navigate('/admin/orders');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete order');
    }
  };

  const handleCancelOrder = async (reason: string) => {
    try {
      setIsProcessing(true);
      await cancelOrder({ id: parseInt(id!), reason }).unwrap();
      toast.success('Order cancelled successfully');
      setShowCancelDialog(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to cancel order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-muted-foreground">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-muted-foreground">Order not found</div>
          <Button className="mt-4" onClick={() => navigate('/admin/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/admin/orders')}
              className="mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{order.order_number}</h1>
                <Badge className={`${statusColors[order.status]} text-sm px-3 py-1.5`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(order.created_at), 'PPP')}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {order.customer?.name || 'Guest'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {canAdminCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            )}
            {order.status !== 'delivered' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {hasPendingCancellationRequest && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-600">
            <strong>Pending Cancellation Request</strong>
            <span className="block mt-1">
              Customer has requested to cancel this order. Review the request in{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-yellow-700 underline"
                onClick={() => navigate('/admin/cancellation-requests')}
              >
                Cancellation Requests
              </Button>
            </span>
            {order.cancellation_reason && (
              <span className="block mt-2 text-sm">Reason: {order.cancellation_reason}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {order.status === 'cancelled' && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            <strong>Order Cancelled</strong>
            {order.cancelled_at && (
              <span className="block text-sm">
                Cancelled on {format(new Date(order.cancelled_at), 'PPP')}
                {order.cancelled_by && ` by ${order.cancelled_by}`}
              </span>
            )}
            {order.cancellation_reason && (
              <span className="block mt-1 text-sm">Reason: {order.cancellation_reason}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="text-center font-semibold">Qty</TableHead>
                      <TableHead className="text-right font-semibold">Price</TableHead>
                      <TableHead className="text-right font-semibold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.order_items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3 py-2">
                            {item.product?.image_url && (
                              <div className="h-14 w-14 rounded-md border bg-muted overflow-hidden flex-shrink-0">
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-foreground">{item.product?.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">SKU: {item.product?.sku}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded bg-muted text-sm font-medium">
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatPrice(
                            item.price,
                            settings?.data?.currency_symbol,
                            settings?.data?.currency_position,
                            settings?.data?.formatted_currency
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatPrice(
                            item.total,
                            settings?.data?.currency_symbol,
                            settings?.data?.currency_position,
                            settings?.data?.formatted_currency
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t bg-muted/20 p-6">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(
                      order.subtotal || order.total_amount,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}</span>
                  </div>
                  {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-green-600">-{formatPrice(
                        order.discount_amount,
                        settings?.data?.currency_symbol,
                        settings?.data?.currency_position,
                        settings?.data?.formatted_currency
                      )}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{formatPrice(
                      order.shipping_cost || 0,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tax ({parseFloat(order.tax_rate || 0).toFixed(2)}%)
                    </span>
                    <span className="font-medium">{formatPrice(
                      order.tax_amount || 0,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(
                      order.total_amount,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Notes Section */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Delivery Address</div>
                  <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                    {order.shipping_address}
                  </p>
                </div>
                {order.notes && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Order Notes</div>
                    <div
                      className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: order.notes }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Status & Customer Info */}
        <div className="space-y-6">
          {/* Status Management Card */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Status Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-3">Current Status</div>
                <Badge className={`${statusColors[order.status]} text-sm px-4 py-2 font-medium`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              {getValidNextStatuses(order.status).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Actions</label>
                    <div className="grid gap-2">
                      {getValidNextStatuses(order.status).map((status) => {
                        const isCancel = status === 'cancelled';
                        const config = {
                          processing: { label: 'Start Processing', icon: Clock, variant: 'default' as const },
                          shipped: { label: 'Mark as Shipped', icon: Truck, variant: 'default' as const },
                          delivered: { label: 'Mark as Delivered', icon: CheckCircle2, variant: 'default' as const },
                          cancelled: { label: 'Cancel Order', icon: XCircle, variant: 'destructive' as const },
                        }[status] || { label: status, icon: Package, variant: 'outline' as const };

                        const Icon = config.icon;

                        return (
                          <Button
                            key={status}
                            variant={config.variant}
                            className="w-full justify-start h-10 px-4"
                            onClick={() => initiateStatusUpdate(status)}
                            disabled={isUpdating}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {config.label}
                          </Button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      Step by step order fulfillment process
                    </p>
                  </div>
                </>
              )}

              {(order.status === 'delivered' || order.status === 'cancelled') && (
                <>
                  <Separator />
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This order is in a final state and cannot be modified.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Full Name</div>
                <div className="text-sm font-medium">{order.customer?.name || 'N/A'}</div>
              </div>

              {order.customer?.email && (
                <>
                  <Separator />
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Email Address</div>
                    <div className="text-sm font-medium break-all">{order.customer.email}</div>
                  </div>
                </>
              )}

              {order.customer?.phone && (
                <>
                  <Separator />
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Phone Number</div>
                    <div className="text-sm font-medium">{order.customer.phone}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline Card */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Created</div>
                <div className="text-sm font-medium">
                  {format(new Date(order.created_at), 'PPP')}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(order.created_at), 'p')}
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Last Updated</div>
                <div className="text-sm font-medium">
                  {format(new Date(order.updated_at), 'PPP')}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(order.updated_at), 'p')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Order"
        description={`Are you sure you want to delete order ${order.order_number}? This action cannot be undone and will release all reserved stock.`}
        variant="destructive"
        confirmText="Delete Order"
      />

      <ConfirmDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onConfirm={handleStatusUpdate}
        title="Update Order Status"
        description={`Are you sure you want to change the status of order ${order.order_number} to "${selectedStatus}"?`}
        confirmText="Update Status"
      />

      <CancelOrderDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelOrder}
        isLoading={isProcessing}
        mode="cancel"
        orderNumber={order.order_number}
      />
    </div>
  );
};

export default OrderDetails;
