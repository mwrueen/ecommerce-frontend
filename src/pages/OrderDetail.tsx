import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetOrderQuery, useRequestOrderCancellationMutation, useCancelOrderMutation } from '@/store/api/ordersApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Package, MapPin, Calendar, XCircle, Clock, AlertCircle, CheckCircle2, Banknote, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';
import { CancelOrderDialog } from '@/components/CancelOrderDialog';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOrderSuccess = searchParams.get('success') === 'true';
  const { toast } = useToast();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: orderData, isLoading } = useGetOrderQuery(id);
  const { data: settings } = useGetPublicSettingsQuery({});
  const [requestCancellation] = useRequestOrderCancellationMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelMode, setCancelMode] = useState<'request' | 'cancel'>('request');
  const [isProcessing, setIsProcessing] = useState(false);

  const order = orderData?.order;

  const handleRequestCancellation = async (reason: string) => {
    try {
      setIsProcessing(true);
      await requestCancellation({ id, reason }).unwrap();
      toast({
        title: 'Cancellation Request Submitted',
        description: 'Your cancellation request has been submitted and is awaiting admin approval.',
      });
      setShowCancelDialog(false);
    } catch (error: any) {
      toast({
        title: 'Request Failed',
        description: error?.data?.message || 'Failed to submit cancellation request',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async (reason: string) => {
    try {
      setIsProcessing(true);
      await cancelOrder({ id, reason }).unwrap();
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully.',
      });
      setShowCancelDialog(false);
    } catch (error: any) {
      toast({
        title: 'Cancellation Failed',
        description: error?.data?.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelDialogConfirm = (reason: string) => {
    if (cancelMode === 'request') {
      handleRequestCancellation(reason);
    } else {
      handleCancelOrder(reason);
    }
  };

  const canRequestCancellation = order?.status === 'pending' && !order?.cancellation_requested_at;
  const canDirectCancel = order?.status === 'pending' && !order?.cancellation_requested_at;
  const hasPendingCancellationRequest = !!order?.cancellation_requested_at && order?.status !== 'cancelled';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Please login to view order details</p>
            <Button className="w-full" onClick={() => navigate('/customer-auth')}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">Order not found</div>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg md:text-xl font-bold">{order.order_number}</h1>
              <p className="text-sm text-muted-foreground">Order Details</p>
            </div>
          </div>
          {(canRequestCancellation || canDirectCancel) && (
            <div className="flex gap-2">
              {canDirectCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setCancelMode('cancel');
                    setShowCancelDialog(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              )}
              {canRequestCancellation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCancelMode('request');
                    setShowCancelDialog(true);
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Request Cancellation
                </Button>
              )}
            </div>
          )}
        </div>

        {isOrderSuccess && (
          <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white border border-indigo-500/30 p-6 shadow-2xl space-y-4 mb-6 relative overflow-hidden">
            <div className="flex items-start gap-4 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <Badge className="bg-emerald-500 text-white border-0 font-bold px-2.5 py-0.5 text-[10px]">
                  ORDER CONFIRMED
                </Badge>
                <h2 className="text-xl sm:text-2xl font-black text-white">🎉 Order Placed Successfully!</h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Thank you for shopping with us. Your order <span className="font-bold text-amber-300">{order.order_number}</span> has been confirmed and is being processed by our warehouse.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 relative z-10 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2 text-slate-200 bg-white/5 p-3 rounded-2xl border border-white/10">
                <Banknote className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-white">Payment Method</p>
                  <p className="text-emerald-300 font-semibold">
                    {order.payment_method === 'cod' ? 'Cash on Delivery (Pay on Receive)' : 'Paid Online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-200 bg-white/5 p-3 rounded-2xl border border-white/10">
                <Truck className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-white">Estimated Delivery</p>
                  <p className="text-amber-200 font-semibold">2 - 4 Business Days</p>
                </div>
              </div>
            </div>
          </div>
        )}
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-600">
              <strong>Cancellation Requested:</strong> Your cancellation request is pending admin approval.
              {order.cancellation_reason && (
                <span className="block mt-1 text-sm">Reason: {order.cancellation_reason}</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {order.status === 'cancelled' && (
          <Alert className="mb-6 border-red-500/50 bg-red-500/10">
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

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  {item.product?.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.product?.name}</h4>
                    <p className="text-sm text-muted-foreground">SKU: {item.product?.sku}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm">Quantity: {item.quantity}</span>
                      <span className="text-sm">
                        Price: {formatPrice(
                          item.price,
                          settings?.data?.currency_symbol,
                          settings?.data?.currency_position,
                          settings?.data?.formatted_currency
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatPrice(
                        item.total,
                        settings?.data?.currency_symbol,
                        settings?.data?.currency_position,
                        settings?.data?.formatted_currency
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {formatPrice(
                      order.subtotal,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}
                  </span>
                </div>

                {parseFloat(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>
                      -{formatPrice(
                        order.discount_amount,
                        settings?.data?.currency_symbol,
                        settings?.data?.currency_position,
                        settings?.data?.formatted_currency
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {formatPrice(
                      order.shipping_cost,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tax ({order.tax_rate}% {order.tax_inclusive ? 'inclusive' : 'exclusive'})
                  </span>
                  <span>
                    {formatPrice(
                      order.tax_amount,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(
                      order.total_amount,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${statusColors[order.status]} text-sm px-3 py-1`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.shipping_address}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Order Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{format(new Date(order.created_at), 'PPP')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(order.created_at), 'p')}
                </p>
              </CardContent>
            </Card>

            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: order.notes }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <CancelOrderDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={handleCancelDialogConfirm}
          isLoading={isProcessing}
          mode={cancelMode}
          orderNumber={order.order_number}
        />
      </div>
    </div>
  );
};

export default OrderDetail;
