import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useGetDealsQuery } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Tag, TrendingUp } from 'lucide-react';

export default function Deals() {
  const navigate = useNavigate();
  const [type, setType] = useState<string>('');
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useGetDealsQuery({
    type: type || undefined,
    per_page: 12,
    page,
  });

  const deals = data?.data || [];
  const pagination = data?.pagination;

  const formatTimeRemaining = (timeRemaining: any) => {
    if (timeRemaining.expired) return 'Expired';
    
    const parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}h`);
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes}m`);
    
    return parts.join(' ') || 'Less than a minute';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Deals & Offers</h1>
          <p className="text-muted-foreground">Save big with our exclusive deals and promotions</p>
        </div>

        <div className="mb-6">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Deals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Deals</SelectItem>
              <SelectItem value="flash">Flash Deals</SelectItem>
              <SelectItem value="product">Product Deals</SelectItem>
              <SelectItem value="category">Category Deals</SelectItem>
              <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
              <SelectItem value="minimum_purchase">Minimum Purchase</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No deals available</h3>
            <p className="text-muted-foreground">Check back later for new deals and offers</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <Card key={deal.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/deals/${deal.slug}`)}>
                  {deal.image_url && (
                    <div className="relative h-48 bg-muted">
                      <img 
                        src={deal.image_url} 
                        alt={deal.title}
                        className="w-full h-full object-cover"
                      />
                      {deal.is_featured && (
                        <Badge className="absolute top-2 right-2" variant="default">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2">{deal.title}</CardTitle>
                      {deal.discount_percentage && (
                        <Badge variant="destructive" className="shrink-0">
                          {deal.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                    {deal.short_description && (
                      <CardDescription className="line-clamp-2">
                        {deal.short_description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Ends in: <span className="font-medium text-foreground">{formatTimeRemaining(deal.time_remaining)}</span>
                        </span>
                      </div>
                      {deal.usage_limit && (
                        <div className="text-sm text-muted-foreground">
                          {deal.usage_limit - deal.usage_count} uses remaining
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => navigate(`/deals/${deal.slug}`)}>
                      View Deal
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {pagination && pagination.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {pagination.last_page}
                </span>
                <Button
                  variant="outline"
                  disabled={page === pagination.last_page}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
        </div>
      </Layout>
  );
}
