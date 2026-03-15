import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, Shield, Star, Clock, Zap, TrendingUp, Sparkles, Gift, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useGetLandingPageDataQuery } from '@/store/api/landingApi';
import ProductCard from '@/components/ProductCard';
import Autoplay from 'embla-carousel-autoplay';
import { formatPrice } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, getStorageUrl } from '@/lib/utils';

const Index = () => {
  const { data: landingData, isLoading, error } = useGetLandingPageDataQuery();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Failed to load landing page</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const heroSection = landingData?.data?.hero_section;
  const siteInfo = landingData?.data?.site_info;
  const featuredCategories = landingData?.data?.featured_categories || [];
  const latestProducts = landingData?.data?.latest_products || [];
  const topSellingProducts = landingData?.data?.top_selling_products || [];
  const featuredDeals = landingData?.data?.featured_deals || [];
  const flashDeals = landingData?.data?.flash_deals || [];

  const sliderImages = heroSection?.slider_images || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Hero Slider Section */}
      {sliderImages.length > 0 && (
        <section className="w-full relative">
          <div className="container mx-auto px-4 py-6 md:py-10">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 5000,
                  stopOnInteraction: false,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="rounded-3xl border bg-card shadow-2xl shadow-primary/5">
                {sliderImages.map((slider, index) => {
                  const slideBody = (
                    <>
                      <img
                        src={getStorageUrl(slider.image)}
                        alt={slider.title || `Slider ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
                      {(slider.title || slider.subtitle) && (
                        <div className="absolute inset-x-0 bottom-0 px-6 pb-6 md:px-10 md:pb-10">
                          <div className="max-w-2xl space-y-4 rounded-2xl border border-white/20 bg-white/10 p-6 md:p-8 text-white shadow-2xl backdrop-blur-xl">
                            {slider.title && (
                              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                                {slider.title}
                              </h2>
                            )}
                            {slider.subtitle && (
                              <p className="text-sm sm:text-base md:text-lg text-white/90">
                                {slider.subtitle}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 pt-2">
                              <Button size="lg" className="rounded-xl bg-white text-black hover:bg-white/90 shadow-lg">
                                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                              <Button size="lg" variant="outline" className="rounded-xl border-white/30 text-white hover:bg-white/10">
                                Learn More
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );

                  return (
                    <CarouselItem key={index}>
                      <div className="relative w-full h-[280px] sm:h-[380px] md:h-[480px] lg:h-[580px] rounded-3xl overflow-hidden group">
                        {slider.hyperlink ? (
                          <Link to={slider.hyperlink} className="block w-full h-full">
                            {slideBody}
                          </Link>
                        ) : (
                          slideBody
                        )}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="left-4 md:left-6 hidden sm:flex h-12 w-12 rounded-xl bg-white/90 hover:bg-white shadow-lg border-0" />
              <CarouselNext className="right-4 md:right-6 hidden sm:flex h-12 w-12 rounded-xl bg-white/90 hover:bg-white shadow-lg border-0" />
            </Carousel>
          </div>
        </section>
      )}

      {/* Hero Text Section */}
      {heroSection && (
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 py-16 md:py-20 lg:py-24 relative">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              {heroSection.tagline && (
                <Badge variant="secondary" className="text-sm md:text-base px-5 py-2 rounded-full bg-primary/10 text-primary border-primary/20 font-medium">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {heroSection.tagline}
                </Badge>
              )}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                {heroSection.title || 'Welcome to Our Store'}
              </h1>
              {heroSection.description && (
                <div
                  className="text-lg md:text-xl text-muted-foreground prose prose-lg max-w-2xl mx-auto"
                  dangerouslySetInnerHTML={{ __html: heroSection.description }}
                />
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/products">
                  <Button size="lg" className="gap-2 text-base px-8 h-14 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                    <ShoppingBag className="h-5 w-5" />
                    Shop Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button size="lg" variant="outline" className="text-base px-8 h-14 rounded-xl hover:bg-muted">
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Bar */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: siteInfo?.free_shipping_threshold ? `On orders over ${formatPrice(siteInfo.free_shipping_threshold.toString(), siteInfo.currency_symbol, 'before', siteInfo.formatted_currency)}` : 'On orders over $50', color: 'from-blue-500 to-cyan-500' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'from-emerald-500 to-green-500' },
              { icon: Star, title: 'Top Quality', desc: 'Premium products', color: 'from-amber-500 to-orange-500' },
              { icon: Gift, title: 'Easy Returns', desc: '30-day guarantee', color: 'from-violet-500 to-purple-500' },
            ].map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity", feature.color)} />
                <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-5 text-center sm:text-left">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shrink-0 shadow-lg", feature.color)}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals Section */}
      {flashDeals.length > 0 && (
        <section className="py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-pink-500/10" />
          <div className="container mx-auto px-4 relative">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <Badge className="mb-2 bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20">
                    <Clock className="h-3 w-3 mr-1" /> Limited Time
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold">Flash Deals</h2>
                  <p className="text-muted-foreground">Grab these deals before they're gone!</p>
                </div>
              </div>
              <Link to="/deals">
                <Button variant="outline" className="gap-2 rounded-xl">
                  View All Deals <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashDeals.slice(0, 4).map((deal) => (
                <Link key={deal.id} to={`/deals/${deal.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-card shadow-lg hover:-translate-y-2">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {deal.image_url ? (
                        <img
                          src={getStorageUrl(deal.image_url)}
                          alt={deal.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Zap className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-lg">
                        <Clock className="h-3 w-3 mr-1" />
                        {deal.time_remaining || 'Limited Time'}
                      </Badge>
                      {deal.discount_percentage && (
                        <Badge className="absolute top-3 left-3 bg-black/80 border-0">
                          -{deal.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {deal.title}
                      </h3>
                      {deal.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {deal.short_description}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        {deal.original_price && deal.deal_price && (
                          <>
                            <span className="text-xl font-bold text-primary">
                              {formatPrice(deal.deal_price, siteInfo?.currency_symbol, 'before', siteInfo?.formatted_currency)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(deal.original_price, siteInfo?.currency_symbol, 'before', siteInfo?.formatted_currency)}
                            </span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Categories */}
      {featuredCategories.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Shop by Category</h2>
              <p className="text-muted-foreground">Explore our wide range of product categories</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredCategories.slice(0, 8).map((category) => (
                <Link key={category.id} to={`/products?category=${category.slug}`}>
                  <Card className="group h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col gap-4 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 rounded-2xl bg-primary/10 p-2 ring-2 ring-primary/10">
                            {category.image_url ? (
                              <img
                                src={getStorageUrl(category.image_url)}
                                alt={category.name}
                                className="h-full w-full rounded-2xl object-cover"
                              />
                            ) : (
                              <ShoppingBag className="h-full w-full text-primary" />
                            )}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">{category.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {category.active_products_count || 0} products
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-xs font-medium text-primary">
                          Shop
                        </Badge>
                      </div>
                      {category.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between text-sm font-semibold text-slate-600">
                        <span>View products</span>
                        <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="border-0 bg-gradient-to-br from-card to-muted/30 shadow-xl">
            <CardContent className="p-6 md:p-10">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    <Sparkles className="h-3 w-3 mr-1" /> Fresh Picks
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Latest Products</h2>
                  <p className="text-muted-foreground mt-1">Check out our newest arrivals</p>
                </div>
                <Link to="/products">
                  <Button variant="outline" className="gap-2 rounded-xl">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="overflow-hidden rounded-2xl border-0 shadow-lg">
                      <Skeleton className="aspect-[4/3] w-full" />
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : latestProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {latestProducts.slice(0, 8).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No products available at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Top Selling Products */}
      {topSellingProducts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">Fan Favorites</p>
                    <h2 className="text-2xl md:text-3xl font-bold">Top Selling Products</h2>
                    <p className="text-muted-foreground">Our most popular items</p>
                  </div>
                </div>
                <Link to="/products">
                  <Button variant="outline" className="gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {topSellingProducts.slice(0, 8).map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    {product.total_sold > 0 && (
                      <Badge className="absolute top-3 left-3 bg-green-500/90 text-[10px]">
                        {product.total_sold} sold
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Deals */}
      {featuredDeals.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 to-primary/10 border-t">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Deals</h2>
                <p className="text-muted-foreground">Special offers you don't want to miss</p>
              </div>
              <Link to="/deals">
                <Button variant="outline" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredDeals.slice(0, 6).map((deal) => (
                <Link key={deal.id} to={`/deals/${deal.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                    <div className="relative aspect-video overflow-hidden bg-secondary">
                      {deal.banner_image_url || deal.image_url ? (
                        <img
                          src={getStorageUrl(deal.banner_image_url || deal.image_url)}
                          alt={deal.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Star className="h-16 w-16" />
                        </div>
                      )}
                      {deal.discount_percentage && (
                        <Badge className="absolute top-2 right-2 bg-primary">
                          -{deal.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4 md:p-6">
                      <h3 className="font-semibold text-lg md:text-xl mb-2 group-hover:text-primary transition-colors">
                        {deal.title}
                      </h3>
                      {deal.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {deal.short_description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {deal.original_price && deal.deal_price && (
                          <>
                            <span className="text-xl md:text-2xl font-bold text-primary">
                              {formatPrice(
                                deal.deal_price,
                                siteInfo?.currency_symbol,
                                'before',
                                siteInfo?.formatted_currency
                              )}
                            </span>
                            <span className="text-sm md:text-base text-muted-foreground line-through">
                              {formatPrice(
                                deal.original_price,
                                siteInfo?.currency_symbol,
                                'before',
                                siteInfo?.formatted_currency
                              )}
                            </span>
                          </>
                        )}
                      </div>
                      {deal.time_remaining && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{deal.time_remaining} remaining</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container mx-auto px-4 text-center relative">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
            <Heart className="h-3 w-3 mr-1" /> Join Our Community
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white tracking-tight">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg md:text-xl mb-10 text-white/90 max-w-2xl mx-auto">
            Join thousands of happy customers and discover amazing products today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2 bg-white text-primary hover:bg-white/90 h-14 px-8 rounded-xl shadow-lg text-base font-semibold">
                Create Account <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 h-14 px-8 rounded-xl text-base font-semibold">
                Browse Products <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
