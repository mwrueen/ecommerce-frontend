import { useParams, useNavigate } from 'react-router-dom';
import { useGetDealQuery, useGetDealStatsQuery } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Edit, TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react';

export default function DealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: dealData, isLoading: dealLoading } = useGetDealQuery(id!);
  const { data: statsData, isLoading: statsLoading } = useGetDealStatsQuery({ deal_id: parseInt(id!) });

  const deal = dealData?.data;
  const stats = statsData?.data;

  if (dealLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Deal not found</h2>
        <Button onClick={() => navigate('/admin/deals')}>Back to Deals</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/deals')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{deal.title}</h1>
              <p className="text-muted-foreground">{deal.slug}</p>
            </div>
          </div>
          <Button onClick={() => navigate(`/admin/deals/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Deal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Total Uses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total_usages || 0}
              </div>
              {deal.usage_limit && (
                <p className="text-xs text-muted-foreground mt-1">
                  of {deal.usage_limit} limit
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Total Discount
              </CardTitle>
            </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total_discount_given ? `$${parseFloat(stats.total_discount_given).toFixed(2)}` : '$0.00'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.total_orders || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Remaining Uses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.remaining_uses !== undefined ? stats.remaining_uses : '∞'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Type</div>
                <Badge variant="outline">{deal.type.replace('_', ' ').toUpperCase()}</Badge>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Discount</div>
                <div className="font-medium">
                  {deal.discount_type === 'percentage' 
                    ? `${deal.discount_value}%` 
                    : `$${parseFloat(deal.discount_value).toFixed(2)}`}
                </div>
              </div>

              {deal.maximum_discount && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Maximum Discount</div>
                  <div className="font-medium">${parseFloat(deal.maximum_discount).toFixed(2)}</div>
                </div>
              )}

              {deal.minimum_purchase_amount && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Minimum Purchase</div>
                  <div className="font-medium">${parseFloat(deal.minimum_purchase_amount).toFixed(2)}</div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-1">Priority</div>
                <div className="font-medium">{deal.priority}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge variant={deal.is_active ? 'default' : 'secondary'}>
                  {deal.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {deal.is_featured && <Badge variant="default">Featured</Badge>}
                <Badge variant={deal.is_valid ? 'default' : 'destructive'}>
                  {deal.is_valid ? 'Valid' : 'Expired'}
                </Badge>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Start Date</div>
                <div className="font-medium">
                  {new Date(deal.start_date).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">End Date</div>
                <div className="font-medium">
                  {new Date(deal.end_date).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {!deal.time_remaining.expired && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Time Remaining</div>
                  <div className="font-medium">
                    {deal.time_remaining.days}d {deal.time_remaining.hours}h {deal.time_remaining.minutes}m
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {deal.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: deal.description }}
              />
            </CardContent>
          </Card>
        )}

        {(deal.applicable_products?.length > 0 || deal.applicable_categories?.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Applicable Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deal.applicable_products?.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Products</div>
                  <div className="flex flex-wrap gap-2">
                    {deal.applicable_products.map((id) => (
                      <Badge key={id} variant="outline">Product ID: {id}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {deal.applicable_categories?.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {deal.applicable_categories.map((id) => (
                      <Badge key={id} variant="outline">Category ID: {id}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {deal.creator && (
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Created By</div>
                <div className="font-medium">{deal.creator.name} ({deal.creator.email})</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(deal.created_at).toLocaleString()}
                </div>
              </div>

              {deal.updater && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Last Updated By</div>
                  <div className="font-medium">{deal.updater.name} ({deal.updater.email})</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(deal.updated_at).toLocaleString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
  );
}
