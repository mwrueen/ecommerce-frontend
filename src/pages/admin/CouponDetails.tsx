import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetCouponQuery, useGetCouponStatsQuery, useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';

export default function CouponDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: settings } = useGetPublicSettingsQuery({});

  const { data: couponData, isLoading } = useGetCouponQuery(id);
  const { data: statsData } = useGetCouponStatsQuery({ coupon_id: parseInt(id!) });

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const coupon = couponData?.data;
  const stats = statsData?.data;

  if (!coupon) {
    return <div className="p-8 text-center">Coupon not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/coupons')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{coupon.name}</h1>
            <p className="text-muted-foreground font-mono">{coupon.code}</p>
          </div>
        </div>
        <Link to={`/admin/coupons/${id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Coupon
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_usages || coupon.usage_count || 0}</div>
            {coupon.usage_limit && (
              <p className="text-xs text-muted-foreground">of {coupon.usage_limit} limit</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Uses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.remaining_uses !== undefined
                ? stats.remaining_uses
                : coupon.usage_limit
                ? coupon.usage_limit - (coupon.usage_count || 0)
                : '∞'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(
                stats?.total_discount_given || '0',
                settings?.data?.currency_symbol,
                settings?.data?.currency_position,
                settings?.data?.formatted_currency
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={coupon.is_active ? 'default' : 'secondary'} className="text-base">
              {coupon.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coupon Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{coupon.description || 'No description'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discount Type</p>
                <Badge variant="outline">
                  {coupon.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discount Value</p>
                <p className="text-sm font-semibold">
                  {coupon.type === 'percentage'
                    ? `${coupon.discount_value}%`
                    : `$${coupon.discount_value}`}
                </p>
              </div>
            </div>
            {coupon.minimum_purchase && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Minimum Purchase</p>
                <p className="text-sm">${coupon.minimum_purchase}</p>
              </div>
            )}
            {coupon.maximum_discount && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maximum Discount</p>
                <p className="text-sm">${coupon.maximum_discount}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restrictions & Validity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valid From</p>
                <p className="text-sm">
                  {coupon.valid_from
                    ? new Date(coupon.valid_from).toLocaleDateString()
                    : 'No start date'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valid Until</p>
                <p className="text-sm">
                  {coupon.valid_until
                    ? new Date(coupon.valid_until).toLocaleDateString()
                    : 'No expiry'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Per-Customer Limit</p>
                <p className="text-sm">{coupon.usage_limit_per_customer || 'Unlimited'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Order Only</p>
                <Badge variant={coupon.first_order_only ? 'default' : 'secondary'}>
                  {coupon.first_order_only ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {coupon.usages && coupon.usages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Usage History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupon.usages.slice(0, 10).map((usage: any) => (
                  <TableRow key={usage.id}>
                    <TableCell>
                      <Link
                        to={`/admin/orders/${usage.order_id}`}
                        className="text-primary hover:underline"
                      >
                        {usage.order?.order_number || `#${usage.order_id}`}
                      </Link>
                    </TableCell>
                    <TableCell>{usage.customer?.name || usage.customer?.email}</TableCell>
                    <TableCell>{formatPrice(
                      usage.order_total_before_discount,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}</TableCell>
                    <TableCell className="text-green-600">
                      -{formatPrice(
                        usage.discount_amount,
                        settings?.data?.currency_symbol,
                        settings?.data?.currency_position,
                        settings?.data?.formatted_currency
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(
                        usage.order_total_after_discount,
                        settings?.data?.currency_symbol,
                        settings?.data?.currency_position,
                        settings?.data?.formatted_currency
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(usage.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
