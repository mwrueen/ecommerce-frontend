import { useParams, useNavigate } from 'react-router-dom';
import { useGetDealQuery } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Tag, TrendingUp, Package, ChevronLeft } from 'lucide-react';
import { getStorageUrl } from '@/lib/utils';

export default function DealDetail() {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useGetDealQuery(identifier!);
  const deal = data?.data;

  const formatTimeRemaining = (timeRemaining: any) => {
    if (timeRemaining.expired) return 'Expired';

    const parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days} days`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours} hours`);
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes} minutes`);

    return parts.join(', ') || 'Less than a minute';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Tag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Deal not found</h2>
        <p className="text-muted-foreground mb-4">This deal may have expired or been removed</p>
        <Button onClick={() => navigate('/deals')}>Browse All Deals</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/deals')}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Deals
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {deal.banner_image_url || deal.image_url ? (
          <div className="relative rounded-lg overflow-hidden bg-muted h-96">
            <img
              src={getStorageUrl(deal.banner_image_url || deal.image_url)}
              alt={deal.title}
              className="w-full h-full object-cover"
            />
            {deal.is_featured && (
              <Badge className="absolute top-4 right-4" variant="default">
                <TrendingUp className="h-4 w-4 mr-1" />
                Featured Deal
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
            <Tag className="h-24 w-24 text-muted-foreground" />
          </div>
        )}

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-4xl font-bold">{deal.title}</h1>
              {deal.discount_percentage && (
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  {deal.discount_percentage}% OFF
                </Badge>
              )}
            </div>
            {deal.short_description && (
              <p className="text-lg text-muted-foreground">{deal.short_description}</p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {formatTimeRemaining(deal.time_remaining)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ends on {new Date(deal.end_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </CardContent>
          </Card>

          {deal.description && (
            <Card>
              <CardHeader>
                <CardTitle>Deal Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: deal.description }}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline">{deal.type.replace('_', ' ').toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium">
                  {deal.discount_type === 'percentage'
                    ? `${deal.discount_value}%`
                    : `$${parseFloat(deal.discount_value).toFixed(2)}`}
                </span>
              </div>
              {deal.maximum_discount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Discount:</span>
                  <span className="font-medium">${parseFloat(deal.maximum_discount).toFixed(2)}</span>
                </div>
              )}
              {deal.minimum_purchase_amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Purchase:</span>
                  <span className="font-medium">${parseFloat(deal.minimum_purchase_amount).toFixed(2)}</span>
                </div>
              )}
              {deal.usage_limit && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining Uses:</span>
                  <span className="font-medium">{deal.usage_limit - deal.usage_count}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate('/products')}
          >
            <Package className="h-5 w-5 mr-2" />
            Shop Now
          </Button>
        </div>
      </div>
    </div>
  );
}
