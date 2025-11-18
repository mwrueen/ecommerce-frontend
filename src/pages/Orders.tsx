import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetOrdersQuery } from '@/store/api/ordersApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, ShoppingBag } from 'lucide-react';
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

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const { data: settings } = useGetPublicSettingsQuery({});

  const { data: ordersData, isLoading } = useGetOrdersQuery({
    page,
    per_page: 10,
    status: status || undefined,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Please login to view your orders</p>
            <Button className="w-full" onClick={() => navigate('/customer-auth')}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>
          <Button onClick={() => navigate('/products')}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        <div className="mb-6">
          <Select value={status || 'all'} onValueChange={(value) => setStatus(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading your orders...</div>
          </div>
        ) : ordersData?.data?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                Start shopping to create your first order
              </p>
              <Button onClick={() => navigate('/products')}>Browse Products</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {ordersData?.data?.map((order: any) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{order.order_number}</h3>
                        <Badge className={statusColors[order.status]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Ordered on {format(new Date(order.created_at), 'PPP')}</p>
                        <p>
                          {order.order_items?.length || 0} items • {formatPrice(
                            order.total_amount,
                            settings?.data?.currency_symbol,
                            settings?.data?.currency_position,
                            settings?.data?.formatted_currency
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {order.order_items?.slice(0, 4).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2">
                          {item.product?.image_url && (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.product?.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {ordersData?.pagination && ordersData.pagination.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {ordersData.pagination.last_page}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === ordersData.pagination.last_page}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
