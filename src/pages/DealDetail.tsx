import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetDealQuery, useGetPublicSettingsQuery } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Tag, TrendingUp, Package, ChevronLeft, Gift, CheckCircle2, Percent, ShieldCheck } from 'lucide-react';
import { getStorageUrl } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';
import ProductCard from '@/components/ProductCard';

export default function DealDetail() {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();

  const { data: settings } = useGetPublicSettingsQuery({});
  const { data, isLoading } = useGetDealQuery(identifier!);
  const deal = data?.data;

  const formatTimeRemaining = (timeRemaining: any) => {
    if (!timeRemaining) return 'Ongoing';
    if (timeRemaining.expired) return 'Expired';

    const parts = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days} days`);
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours} hours`);
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes} minutes`);

    return parts.join(', ') || 'Less than a minute';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-10">
        <div className="container mx-auto px-4 max-w-7xl space-y-8">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[450px] lg:col-span-2 rounded-3xl" />
            <Skeleton className="h-[450px] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center py-16">
        <div className="container mx-auto px-4 text-center max-w-md space-y-4">
          <div className="h-20 w-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Tag className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Deal Not Found</h2>
          <p className="text-sm text-slate-500">This promotional deal may have expired, been paused, or removed.</p>
          <Button className="rounded-full px-6 font-bold bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/deals')}>
            Browse All Deals
          </Button>
        </div>
      </div>
    );
  }

  const isPercentage = deal.discount_type === 'percentage';
  const products = deal.products || [];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="container mx-auto px-4 max-w-7xl space-y-8">
        {/* Navigation */}
        <Button
          variant="ghost"
          className="rounded-xl font-semibold hover:bg-white text-slate-600"
          onClick={() => navigate('/deals')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Deals
        </Button>

        {/* Hero & Deal Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Media Container */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-xl border border-slate-200 aspect-[16/9] min-h-[320px]">
              {deal.banner_image_url || deal.image_url ? (
                <img
                  src={getStorageUrl(deal.banner_image_url || deal.image_url)}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 text-white p-8 text-center">
                  <Tag className="h-16 w-16 text-indigo-400 mb-3 opacity-80" />
                  <h1 className="text-3xl font-black">{deal.title}</h1>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                <Badge className="bg-slate-900/80 backdrop-blur-md text-white border border-white/20 text-xs uppercase font-bold tracking-wider rounded-full px-3 py-1">
                  {deal.type.replace(/_/g, ' ')}
                </Badge>
                {deal.is_featured && (
                  <Badge className="bg-amber-400 text-slate-950 font-black text-xs rounded-full px-3 py-1 border-0">
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                    Featured Offer
                  </Badge>
                )}
              </div>

              {/* Discount Highlight Banner */}
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{deal.title}</h1>
                  {deal.short_description && (
                    <p className="text-slate-200 text-sm mt-1 line-clamp-1">{deal.short_description}</p>
                  )}
                </div>
                {isPercentage ? (
                  <Badge className="bg-rose-600 text-white text-xl sm:text-2xl font-black px-4 py-2 rounded-2xl shadow-xl border border-rose-400/30">
                    {deal.discount_value}% OFF
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-600 text-white text-xl sm:text-2xl font-black px-4 py-2 rounded-2xl shadow-xl border border-emerald-400/30">
                    SAVE {formatPrice(deal.discount_value, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description Card */}
            {deal.description && (
              <Card className="rounded-3xl border border-slate-200/80 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">About This Offer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: deal.description }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Offer Details Sidebar */}
          <div className="space-y-6">
            {/* Timer Card */}
            {deal.time_remaining && (
              <Card className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    Offer Countdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-3xl font-black text-amber-300">
                    {formatTimeRemaining(deal.time_remaining)}
                  </p>
                  <p className="text-xs text-slate-300">
                    Offer expires on{' '}
                    <span className="font-semibold text-white">
                      {new Date(deal.end_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Deal Terms Breakdown */}
            <Card className="rounded-3xl border border-slate-200/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  Offer Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Promotion Type:</span>
                  <Badge variant="outline" className="rounded-full font-bold uppercase text-[10px]">
                    {deal.type.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Discount Amount:</span>
                  <span className="font-bold text-slate-900">
                    {isPercentage
                      ? `${deal.discount_value}%`
                      : formatPrice(deal.discount_value, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                  </span>
                </div>

                {deal.minimum_purchase_amount && (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Minimum Purchase Required:</span>
                    <span className="font-bold text-indigo-600">
                      {formatPrice(deal.minimum_purchase_amount, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                    </span>
                  </div>
                )}

                {deal.maximum_discount && (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Maximum Discount Cap:</span>
                    <span className="font-bold text-slate-900">
                      {formatPrice(deal.maximum_discount, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}
                    </span>
                  </div>
                )}

                {deal.type === 'buy_x_get_y' && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Gift className="h-4 w-4 text-emerald-600" />
                      Buy {deal.buy_quantity}, Get {deal.get_quantity} Free Gift!
                    </div>
                    <p className="text-[11px] text-emerald-700">Free product will automatically apply upon meeting purchase quantity.</p>
                  </div>
                )}

                {deal.usage_limit && (
                  <div className="flex justify-between py-2 border-b border-slate-100 text-xs">
                    <span className="text-slate-500">Total Uses Remaining:</span>
                    <span className="font-bold text-slate-900">{deal.usage_limit - deal.usage_count} left</span>
                  </div>
                )}

                {deal.categories && deal.categories.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <span className="text-xs text-slate-500 font-semibold">Eligible Categories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {deal.categories.map((cat: any) => (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          className="rounded-full text-xs cursor-pointer hover:bg-slate-200 transition-colors"
                          onClick={() => navigate(`/products?category=${cat.slug}`)}
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Eligible Products Section */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Eligible Promotional Products</h2>
              <p className="text-sm text-slate-500">Shop items covered under this promotional deal</p>
            </div>
            <Button
              className="rounded-full font-bold bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate('/products')}
            >
              <Package className="h-4 w-4 mr-2" />
              Browse All Products
            </Button>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    active_deal: deal,
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-3xl border border-slate-200 p-8 text-center bg-white shadow-xs">
              <Package className="h-12 w-12 mx-auto text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Sitewide or Category Promotion</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
                This promotion applies across store categories or minimum order thresholds. Browse our full catalog to add items to your cart.
              </p>
              <Button
                className="rounded-full px-8 font-bold bg-indigo-600 hover:bg-indigo-700"
                onClick={() => navigate('/products')}
              >
                Shop Catalog
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
