import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, Shield, Star, Clock, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useGetLandingPageDataQuery } from '@/store/api/landingApi';
import ProductCard from '@/components/ProductCard';
import Autoplay from 'embla-carousel-autoplay';
import { formatPrice } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="min-h-screen bg-background">
      {/* Hero Slider Section */}
      {sliderImages.length > 0 && (
        <section className="w-full relative">
          <div className="container mx-auto px-4 py-6 md:py-8">
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
              <CarouselContent>
                {sliderImages.map((slider, index) => (
                  <CarouselItem key={index}>
                    <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] rounded-xl overflow-hidden group">
                      {slider.hyperlink ? (
                        <Link to={slider.hyperlink} className="block w-full h-full">
                          <img
                            src={slider.image}
                            alt={slider.title || `Slider ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {(slider.title || slider.subtitle) && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                              <div className="p-6 md:p-10 lg:p-12 w-full">
                                {slider.title && (
                                  <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 drop-shadow-2xl">
                                    {slider.title}
                                  </h2>
                                )}
                                {slider.subtitle && (
                                  <p className="text-white/95 text-base sm:text-lg md:text-xl lg:text-2xl drop-shadow-lg max-w-2xl">
                                    {slider.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </Link>
                      ) : (
                        <>
                          <img
                            src={slider.image}
                            alt={slider.title || `Slider ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {(slider.title || slider.subtitle) && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                              <div className="p-6 md:p-10 lg:p-12 w-full">
                                {slider.title && (
                                  <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 drop-shadow-2xl">
                                    {slider.title}
                                  </h2>
                                )}
                                {slider.subtitle && (
                                  <p className="text-white/95 text-base sm:text-lg md:text-xl lg:text-2xl drop-shadow-lg max-w-2xl">
                                    {slider.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 md:left-4 hidden sm:flex" />
              <CarouselNext className="right-2 md:right-4 hidden sm:flex" />
            </Carousel>
          </div>
        </section>
      )}

      {/* Hero Text Section */}
      {heroSection && (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 border-b">
          <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
            <div className="mx-auto max-w-4xl text-center">
              {heroSection.tagline && (
                <Badge variant="secondary" className="mb-4 text-sm md:text-base">
                  {heroSection.tagline}
                </Badge>
              )}
              <h1 className="mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {heroSection.title || 'Welcome to Our Store'}
              </h1>
              {heroSection.description && (
                <div
                  className="mb-8 text-base md:text-lg text-muted-foreground prose prose-sm md:prose-base max-w-none"
                  dangerouslySetInnerHTML={{ __html: heroSection.description }}
                />
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <Button size="lg" className="gap-2 text-base px-8">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button size="lg" variant="outline" className="text-base px-8">
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Bar */}
      <section className="py-8 md:py-10 border-b bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base">Free Shipping</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {siteInfo?.free_shipping_threshold
                    ? `On orders over ${formatPrice(siteInfo.free_shipping_threshold.toString(), siteInfo.currency_symbol, 'before', siteInfo.formatted_currency)}`
                    : 'On orders over $50'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base">Secure Payment</h3>
                <p className="text-xs md:text-sm text-muted-foreground">100% protected</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base">Top Quality</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Premium products</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base">Easy Returns</h3>
                <p className="text-xs md:text-sm text-muted-foreground">30-day guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Deals Section */}
      {flashDeals.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-b">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">Flash Deals</h2>
                  <p className="text-sm md:text-base text-muted-foreground">Limited time offers - Don't miss out!</p>
                </div>
              </div>
              <Link to="/deals">
                <Button variant="outline" className="gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {flashDeals.slice(0, 4).map((deal) => (
                <Link key={deal.id} to={`/deals/${deal.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-orange-200 dark:border-orange-900">
                    <div className="relative aspect-square overflow-hidden bg-secondary">
                      {deal.image_url ? (
                        <img
                          src={deal.image_url}
                          alt={deal.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Zap className="h-16 w-16" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {deal.time_remaining || 'Limited Time'}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {deal.title}
                      </h3>
                      {deal.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {deal.short_description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        {deal.original_price && deal.deal_price && (
                          <>
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(
                                deal.deal_price,
                                siteInfo?.currency_symbol,
                                'before',
                                siteInfo?.formatted_currency
                              )}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(
                                deal.original_price,
                                siteInfo?.currency_symbol,
                                'before',
                                siteInfo?.formatted_currency
                              )}
                            </span>
                            {deal.discount_percentage && (
                              <Badge variant="destructive" className="ml-auto">
                                -{deal.discount_percentage}%
                              </Badge>
                            )}
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
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 h-full">
                    <CardContent className="p-6 text-center">
                      <div className="mb-4 mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm md:text-base mb-1">{category.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {category.active_products_count || 0} products
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Latest Products</h2>
              <p className="text-muted-foreground">Check out our newest arrivals</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {latestProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Selling Products */}
      {topSellingProducts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {topSellingProducts.slice(0, 8).map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  {product.total_sold && product.total_sold > 0 && (
                    <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
                      {product.total_sold} sold
                    </Badge>
                  )}
                </div>
              ))}
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
                          src={deal.banner_image_url || deal.image_url}
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
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of happy customers and discover amazing products today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Create Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Browse Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
