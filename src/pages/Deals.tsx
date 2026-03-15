import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDealsQuery } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Tag, TrendingUp } from 'lucide-react';
import { getStorageUrl } from '@/lib/utils';

export default function Deals() {
  const navigate = useNavigate();
  const [type, setType] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetDealsQuery({
    type: type === 'all' ? undefined : type,
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

  const filters = [
    { label: 'All Deals', value: 'all' },
    { label: 'Flash Deals', value: 'flash' },
    { label: 'Product Deals', value: 'product' },
    { label: 'Category Deals', value: 'category' },
    { label: 'Buy X Get Y', value: 'buy_x_get_y' },
    { label: 'Minimum Purchase', value: 'minimum_purchase' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white py-10">
      <div className="container mx-auto px-4 space-y-8">
        <section className="rounded-3xl border border-slate-100 bg-white/95 p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Deals & Offers</p>
              <h1 className="text-3xl md:text-4xl font-bold">Save big with curated promotions</h1>
              <p className="text-muted-foreground">
                Flash savings, exclusive bundle pricing, and seasonal promos updated daily.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {filters.map((f) => (
                <Button
                  key={f.value}
                  variant={type === f.value ? 'default' : 'outline'}
                  className={`rounded-full ${type === f.value ? 'bg-primary text-primary-foreground' : 'border-slate-200'}`}
                  onClick={() => setType(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-3xl border border-slate-100">
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
                  <Card key={deal.id} className="group overflow-hidden rounded-3xl border border-slate-100 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate(`/deals/${deal.slug}`)}>
                    {deal.image_url && (
                      <div className="relative h-48 bg-muted">
                        <img
                          src={getStorageUrl(deal.image_url)}
                          alt={deal.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {deal.is_featured && (
                          <Badge className="absolute top-2 right-2 rounded-full" variant="default">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2">{deal.title}</CardTitle>
                        {deal.discount_percentage && (
                          <Badge variant="destructive" className="shrink-0 rounded-full px-3 py-1 text-xs">
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
                    <CardContent className="space-y-3">
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
                      <Button className="w-full rounded-full" onClick={() => navigate(`/deals/${deal.slug}`)}>
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
        </section>
      </div>
    </div>
  );
}
