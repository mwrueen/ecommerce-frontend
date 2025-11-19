import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetOrderQuery } from '@/store/api/ordersApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, MapPin, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';

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
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: orderData, isLoading } = useGetOrderQuery(id);
  const { data: settings } = useGetPublicSettingsQuery({});

  const order = orderData?.order;

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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{order.order_number}</h1>
            <p className="text-muted-foreground">Order Details</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
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
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
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
                  <CardTitle>Order Notes</CardTitle>
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
      </div>
    </div>
  );
};

export default OrderDetail;
