import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDealsQuery, useGetPublicSettingsQuery } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Tag, TrendingUp, Sparkles, Flame, Gift, Percent, ArrowRight, ShoppingBag } from 'lucide-react';
import { getStorageUrl } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';

export default function Deals() {
  const navigate = useNavigate();
  const [type, setType] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data: settings } = useGetPublicSettingsQuery({});
  const { data, isLoading } = useGetDealsQuery({
    type: type === 'all' ? undefined : type,
    per_page: 12,
    page,
  });

  const deals = data?.data || [];
  const pagination = data?.pagination;

  const formatTimeRemaining = (timeRemaining: any) => {
    if (!timeRemaining) return 'Ongoing';
    if (timeRemaining.expired) return 'Expired';

    const parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}h`);
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes}m`);

    return parts.join(' ') || 'Less than a minute';
  };

  const filters = [
    { label: 'All Deals', value: 'all', icon: Tag },
    { label: 'Flash Deals', value: 'flash', icon: Flame },
    { label: 'Product Deals', value: 'product', icon: ShoppingBag },
    { label: 'Category Deals', value: 'category', icon: Sparkles },
    { label: 'Buy X Get Y', value: 'buy_x_get_y', icon: Gift },
    { label: 'Min Purchase', value: 'minimum_purchase', icon: Percent },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="container mx-auto px-4 max-w-7xl space-y-10">
        {/* Hero Section */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-8 sm:p-12 text-white border border-indigo-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 translate-y-12 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="relative z-10 space-y-6 max-w-3xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-400 text-slate-950 border-0 font-extrabold px-3 py-1 text-xs tracking-wider uppercase">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Exclusive Savings
              </Badge>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs font-semibold px-3 py-1">
                Updated Daily
              </Badge>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Unlock Special Deals & Limited Offers
            </h1>
            
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Explore flash sales, volume discounts, category promos, and free gift bundles. Save big on top products before time runs out!
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {filters.map((f) => {
                const Icon = f.icon;
                const active = type === f.value;
                return (
                  <Button
                    key={f.value}
                    variant={active ? 'default' : 'outline'}
                    className={`rounded-full px-5 py-2 h-10 font-semibold text-xs transition-all ${
                      active
                        ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 border-amber-400 shadow-md shadow-amber-400/20'
                        : 'border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => {
                      setType(f.value);
                      setPage(1);
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                    {f.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Deals Listing */}
        <section className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <Skeleton className="h-52 w-full" />
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center shadow-xs space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Tag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No deals available</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                There are currently no active promotions for this category filter. Check back soon for new offers!
              </p>
              <Button
                variant="outline"
                className="rounded-full px-6"
                onClick={() => setType('all')}
              >
                View All Deals
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => {
                  const isPercentage = deal.discount_type === 'percentage';
                  const hasImage = deal.image_url || deal.banner_image_url;

                  return (
                    <Card
                      key={deal.id}
                      className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      onClick={() => navigate(`/deals/${deal.slug}`)}
                    >
                      <div>
                        <div className="relative h-52 bg-slate-900 overflow-hidden">
                          {hasImage ? (
                            <img
                              src={getStorageUrl(deal.banner_image_url || deal.image_url)}
                              alt={deal.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 text-center">
                              <Tag className="h-12 w-12 text-indigo-400 mb-2 opacity-80" />
                              <span className="font-bold text-lg">{deal.title}</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                            <Badge className="bg-slate-900/80 backdrop-blur-md text-white border border-white/20 text-[10px] uppercase font-bold tracking-wider rounded-full px-3 py-1">
                              {deal.type.replace(/_/g, ' ')}
                            </Badge>

                            {deal.is_featured && (
                              <Badge className="bg-amber-400 text-slate-950 font-bold text-[10px] rounded-full px-2.5 py-0.5 border-0">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>

                          {/* Discount Overlay Badge */}
                          <div className="absolute bottom-3 left-4">
                            {isPercentage ? (
                              <Badge className="bg-rose-600 text-white text-base font-black px-3 py-1 rounded-xl shadow-lg border border-rose-400/30">
                                {deal.discount_value}% OFF
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-600 text-white text-base font-black px-3 py-1 rounded-xl shadow-lg border border-emerald-400/30">
                                SAVE {formatPrice(deal.discount_value, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <CardHeader className="space-y-2 p-6 pb-2">
                          <CardTitle className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {deal.title}
                          </CardTitle>
                          {deal.short_description && (
                            <CardDescription className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {deal.short_description}
                            </CardDescription>
                          )}
                        </CardHeader>

                        <CardContent className="p-6 pt-2 space-y-3 text-xs text-slate-600">
                          {deal.time_remaining && (
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/80 font-medium">
                              <Clock className="h-4 w-4 text-indigo-600 shrink-0" />
                              <span>Ends in: <strong className="text-slate-900 font-bold">{formatTimeRemaining(deal.time_remaining)}</strong></span>
                            </div>
                          )}

                          {deal.minimum_purchase_amount && (
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Min Purchase:</span>
                              <span className="font-semibold text-slate-900">
                                {formatPrice(deal.minimum_purchase_amount, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                              </span>
                            </div>
                          )}

                          {deal.usage_limit && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                                <span>Claims Remaining</span>
                                <span>{deal.usage_limit - deal.usage_count} / {deal.usage_limit}</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600 rounded-full"
                                  style={{
                                    width: `${Math.min(100, (deal.usage_count / deal.usage_limit) * 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </div>

                      <CardFooter className="p-6 pt-0">
                        <Button className="w-full rounded-2xl h-11 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 group-hover:shadow-lg transition-all flex items-center justify-center gap-2">
                          View Offer
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>

              {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center items-center gap-3 pt-6">
                  <Button
                    variant="outline"
                    className="rounded-xl font-semibold"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-semibold text-slate-600 px-2">
                    Page {page} of {pagination.last_page}
                  </span>
                  <Button
                    variant="outline"
                    className="rounded-xl font-semibold"
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
