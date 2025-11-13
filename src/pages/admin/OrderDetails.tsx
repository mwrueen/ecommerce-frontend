import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderQuery, useUpdateOrderStatusMutation, useDeleteOrderMutation } from '@/store/api/ordersApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trash2, Package, User, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

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
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const order = orderData?.order;

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

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatus({ id: parseInt(id!), status: newStatus }).unwrap();
      toast.success('Order status updated successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update order status');
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{order.order_number}</h1>
            <p className="text-muted-foreground">Order Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {order.status !== 'delivered' && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.product?.image_url && (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.product?.name}</div>
                          <div className="text-sm text-muted-foreground">SKU: {item.product?.sku}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${parseFloat(item.price).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${parseFloat(item.total).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge className={`${statusColors[order.status]} text-sm px-3 py-1`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              {getValidNextStatuses(order.status).length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select
                    value={order.status}
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {getValidNextStatuses(order.status).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {order.status === 'pending' && 'Can transition to: Processing or Cancelled'}
                    {order.status === 'processing' && 'Can transition to: Shipped or Cancelled'}
                    {order.status === 'shipped' && 'Can transition to: Delivered or Cancelled'}
                  </p>
                </div>
              )}
              {(order.status === 'delivered' || order.status === 'cancelled') && (
                <p className="text-sm text-muted-foreground">
                  This order is in a final state and cannot be modified.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{order.customer?.name || 'N/A'}</div>
              </div>
              {order.customer?.email && (
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{order.customer.email}</div>
                </div>
              )}
              {order.customer?.phone && (
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{order.customer.phone}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{order.shipping_address}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Order Date</div>
                <div className="font-medium">
                  {format(new Date(order.created_at), 'PPpp')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="font-medium">
                  {format(new Date(order.updated_at), 'PPpp')}
                </div>
              </div>
              {order.notes && (
                <div>
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <div className="text-sm">{order.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Order"
        description={`Are you sure you want to delete order ${order.order_number}? This action cannot be undone.`}
      />
    </div>
  );
};

export default OrderDetails;
