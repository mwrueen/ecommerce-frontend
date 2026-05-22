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

  const mockup = heroSection?.mockup || {
    badge: 'Hot Release',
    product_name: 'VibePro Wireless ANC Headphones',
    product_description: 'Experience audio purity with our flagship adaptive noise cancelling technology.',
    price: '299.00',
    discount: 'Save 25%',
    rating: '4.9',
    happy_users: '10K+',
    link: '/products',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background overflow-x-hidden">
      {/* Hero Slider Section (When Slider Images exist) */}
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
                              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
                                {slider.title}
                              </h2>
                            )}
                            {slider.subtitle && (
                              <p className="text-sm sm:text-base md:text-lg text-white/90">
                                {slider.subtitle}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 pt-2">
                              <Button size="lg" className="rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white hover:opacity-95 shadow-lg border-0">
                                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                              <Button size="lg" className="rounded-xl bg-transparent border border-white/30 text-white hover:bg-white/10 hover:text-white transition-all">
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

      {/* Hero Text Section (When Slider Images are absent) */}
      {heroSection && (
        <section
          className="relative overflow-hidden py-16 md:py-24 lg:py-32 transition-all duration-500"
          style={
            heroSection.bg_type === 'image' && heroSection.bg_image
              ? {
                  backgroundImage: `url(${getStorageUrl(heroSection.bg_image)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : heroSection.bg_type === 'color' && heroSection.bg_color
              ? {
                  background: heroSection.bg_color,
                }
              : {
                  background: 'linear-gradient(to bottom, rgb(99 102 241 / 0.05), rgb(99 102 241 / 0.02), transparent)',
                }
          }
        >
          {/* Blur Overlay when background is an image to ensure readability and contrast */}
          {heroSection.bg_type === 'image' && heroSection.bg_image && (
            <div className="absolute inset-0 bg-background/80 dark:bg-background/80 backdrop-blur-[2px] -z-10" />
          )}
          
          {/* Decorative Background Blobs (Only shown when not using an image background) */}
          {(!heroSection.bg_type || heroSection.bg_type !== 'image') && (
            <>
              <div className="absolute top-1/4 left-1/10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
              <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
            </>
          )}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] -z-10" />
          
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Copy & Actions */}
              <div className="lg:col-span-7 space-y-8 text-left">
                {heroSection.tagline && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>{heroSection.tagline}</span>
                  </div>
                )}
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
                  {heroSection.title || 'Welcome to Our Store'}{' '}
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Redefined.
                  </span>
                </h1>
                
                {heroSection.description && (
                  <div
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed prose prose-slate dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: heroSection.description }}
                  />
                )}
                
                {/* Visual Benefits Checkmarks */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    'Premium Quality Products',
                    'Secure Global Payments',
                    '24/7 Priority Support',
                    'Super Fast Shipping'
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/products">
                    <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8 h-14 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-primary to-indigo-600">
                      <ShoppingBag className="h-5 w-5" />
                      Shop Catalog
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/categories">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-14 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                      Explore Categories
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Premium Visual Mockup */}
              <div className="lg:col-span-5 relative lg:block">
                <div className="relative mx-auto w-full max-w-[420px] aspect-[4/5] rounded-[36px] bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent p-4 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-purple-600/30 rounded-[36px] filter blur-2xl opacity-40 -z-10 animate-pulse" />
                  
                  {/* Inside card content */}
                  <Link to={mockup.link || '/products'} className="h-full w-full block">
                    <div className="h-full w-full rounded-[28px] overflow-hidden bg-slate-950/90 text-white p-6 flex flex-col justify-between relative transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShoppingBag className="h-48 w-48 text-white" />
                      </div>
                      
                      {/* Header Widget */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                          <div className="h-3 w-3 rounded-full bg-yellow-500" />
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                        </div>
                        <Badge className="bg-white/10 text-white border-0">Live Platform</Badge>
                      </div>

                      {/* Main Showcase Element */}
                      <div className="my-auto space-y-6">
                        <div className="space-y-2">
                          {mockup.badge && <Badge className="bg-gradient-to-r from-primary to-purple-600 border-0">{mockup.badge}</Badge>}
                          <h3 className="text-2xl font-bold tracking-tight">{mockup.product_name || 'Featured Product'}</h3>
                          {mockup.product_description && <p className="text-sm text-slate-400">{mockup.product_description}</p>}
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-400">Exclusive Launch Price</p>
                            <p className="text-2xl font-black text-white">
                              {siteInfo?.currency_symbol || '$'}{mockup.price || '299.00'}
                            </p>
                          </div>
                          {mockup.discount && (
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-semibold px-2.5 py-1">
                              {mockup.discount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Bottom Stat Widgets */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div className="text-center bg-white/5 rounded-xl p-3 border border-white/5">
                          <p className="text-xs text-slate-400">Rating</p>
                          <p className="text-lg font-bold text-white flex items-center justify-center gap-1">
                            {mockup.rating || '4.9'} <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          </p>
                        </div>
                        <div className="text-center bg-white/5 rounded-xl p-3 border border-white/5">
                          <p className="text-xs text-slate-400">Happy Users</p>
                          <p className="text-lg font-bold text-white">{mockup.happy_users || '10K+'}</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Floating badge 1 */}
                  <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold dark:text-white">Secure checkout</p>
                      <p className="text-[10px] text-muted-foreground">100% Protected</p>
                    </div>
                  </div>

                  {/* Floating badge 2 */}
                  <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold dark:text-white">Free Delivery</p>
                      <p className="text-[10px] text-muted-foreground">Order above $50</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Bar */}
      <section className="py-12 md:py-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Truck, 
                title: 'Free Shipping', 
                desc: siteInfo?.free_shipping_threshold ? `On orders over ${formatPrice(siteInfo.free_shipping_threshold.toString(), siteInfo.currency_symbol, 'before', siteInfo.formatted_currency)}` : 'On orders over $50', 
                color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5 hover:border-indigo-500/40 shadow-lg shadow-indigo-500/10' 
              },
              { 
                icon: Shield, 
                title: 'Secure Payment', 
                desc: '100% protected checkout', 
                color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
              },
              { 
                icon: Star, 
                title: 'Top Quality', 
                desc: 'Curated premium products', 
                color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5 hover:border-amber-500/40 shadow-lg shadow-amber-500/10' 
              },
              { 
                icon: Gift, 
                title: 'Easy Returns', 
                desc: '30-day money back guarantee', 
                color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5 hover:border-purple-500/40 shadow-lg shadow-purple-500/10' 
              },
            ].map((feature, index) => (
              <Card key={index} className={cn(
                "group relative overflow-hidden bg-card border border-slate-100 dark:border-slate-800 shadow-xl",
                "transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl",
                "flex flex-col p-6 rounded-[24px]"
              )}>
                {/* Glow backdrop */}
                <div className={cn("absolute -right-16 -top-16 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500", feature.color.split(' ')[2])} />
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 relative z-10">
                  <div className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-110",
                    feature.color.split(' ').slice(0, 4).join(' ')
                  )}>
                    <feature.icon className="h-6 w-6 transition-transform duration-500 group-hover:rotate-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{feature.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">{feature.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals Section */}
      {flashDeals.length > 0 && (
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-[36px] bg-slate-950 text-white border border-slate-800 shadow-2xl p-8 md:p-12 lg:p-16">
              {/* Abstract lights background */}
              <div className="absolute top-0 right-0 h-[400px] w-[400px] bg-gradient-to-bl from-orange-600/20 to-red-600/20 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-gradient-to-tr from-primary/10 to-purple-600/10 rounded-full blur-3xl -z-10" />
              <div className="absolute inset-0 bg-grid-pattern opacity-10 -z-10" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 pb-8 border-b border-white/10">
                <div className="space-y-4 text-left">
                  <Badge className="bg-orange-500 text-white border-0 font-bold px-3 py-1 flex w-fit gap-1 items-center">
                    <Zap className="h-3.5 w-3.5 fill-current" /> Live Deal Event
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Flash Deals</h2>
                  <p className="text-slate-400 text-base max-w-xl">Supercharge your savings with our strictly limited-time offers. Act fast before they sell out!</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-3 border border-white/10 backdrop-blur-md">
                    <Clock className="h-5 w-5 text-orange-400" />
                    <span className="font-mono text-sm tracking-wide text-orange-200">Deals refresh daily</span>
                  </div>
                  <Link to="/deals">
                    <Button variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10 hover:border-white/40 h-12 gap-2">
                      Explore All Deals <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {flashDeals.slice(0, 4).map((deal) => (
                  <Link key={deal.id} to={`/deals/${deal.slug}`} className="group">
                    <div className="relative h-full overflow-hidden rounded-[24px] border border-white/5 bg-white/5 backdrop-blur-md shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-white/15 hover:bg-white/10 flex flex-col">
                      <div className="relative aspect-square overflow-hidden bg-white/5">
                        {deal.image_url ? (
                          <img
                            src={getStorageUrl(deal.image_url)}
                            alt={deal.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-500">
                            <Zap className="h-16 w-16" />
                          </div>
                        )}
                        
                        {/* Status overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 transition-opacity group-hover:opacity-85" />
                        
                        {deal.discount_percentage && (
                          <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 font-extrabold text-xs shadow-lg rounded-xl px-2.5 py-1">
                            -{deal.discount_percentage}% OFF
                          </Badge>
                        )}
                        
                        {deal.time_remaining && (
                          <Badge className="absolute bottom-4 right-4 bg-slate-950/80 text-orange-400 border border-white/10 text-[10px] font-bold rounded-lg px-2 py-0.5 backdrop-blur-md">
                            <Clock className="h-3 w-3 mr-1" />
                            {deal.time_remaining}
                          </Badge>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-grow text-left space-y-3">
                        <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-primary transition-colors">
                          {deal.title}
                        </h3>
                        
                        {deal.short_description && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {deal.short_description}
                          </p>
                        )}
                        
                        <div className="pt-2 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2">
                            {deal.original_price && deal.deal_price && (
                              <>
                                <span className="text-xl font-black text-orange-400">
                                  {formatPrice(deal.deal_price, siteInfo?.currency_symbol, 'before', siteInfo?.formatted_currency)}
                                </span>
                                <span className="text-xs text-slate-500 line-through">
                                  {formatPrice(deal.original_price, siteInfo?.currency_symbol, 'before', siteInfo?.formatted_currency)}
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="h-8 w-8 rounded-full bg-white/5 group-hover:bg-orange-500/20 border border-white/10 flex items-center justify-center text-white group-hover:text-orange-400 transition-all duration-300">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Categories */}
      {featuredCategories.length > 0 && (
        <section className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16 space-y-3">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Collections
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Shop by Category</h2>
              <p className="text-muted-foreground text-base">Explore our handpicked premium collections curated just for you</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredCategories.slice(0, 8).map((category) => (
                <Link key={category.id} to={`/products?category=${category.slug}`} className="group">
                  <div className={cn(
                    "relative overflow-hidden rounded-[28px] border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xl",
                    "p-6 h-full flex flex-col justify-between transition-all duration-500",
                    "hover:-translate-y-2 hover:shadow-2xl hover:border-primary/20"
                  )}>
                    {/* Corner gradient animation */}
                    <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full transition-all duration-500 group-hover:scale-150" />
                    
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-[20px] bg-gradient-to-br from-primary/10 to-primary/5 p-3 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                          {category.image_url ? (
                            <img
                              src={getStorageUrl(category.image_url)}
                              alt={category.name}
                              className="h-full w-full rounded-[14px] object-cover"
                            />
                          ) : (
                            <ShoppingBag className="h-7 w-7 text-primary" />
                          )}
                        </div>
                        
                        <div className="text-left">
                          <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-200 transition-colors group-hover:text-primary">
                            {category.name}
                          </h3>
                          <Badge className="mt-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[10px] border-0">
                            {category.active_products_count || 0} Products
                          </Badge>
                        </div>
                      </div>

                      {category.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed text-left">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between text-sm font-bold text-slate-600 dark:text-slate-400 relative z-10">
                      <span className="group-hover:text-primary transition-colors">Browse Collection</span>
                      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:translate-x-1">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-card to-slate-50/50 dark:to-slate-900/10 rounded-[36px] border border-slate-100 dark:border-slate-800/80 p-8 md:p-12 shadow-xl">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2 text-left">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-bold">
                  <Sparkles className="h-3 w-3 mr-1" /> New Arrivals
                </Badge>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Latest Products</h2>
                <p className="text-muted-foreground text-sm">Discover our freshest collections and latest trends</p>
              </div>
              <Link to="/products">
                <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 h-12 px-6 gap-2">
                  View All Products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-[24px] border-0 shadow-lg bg-card">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="p-5 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : latestProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {latestProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/45 mb-4" />
                <h3 className="font-bold text-lg">No Products Yet</h3>
                <p className="text-muted-foreground text-sm mt-1">Check back soon for new arrivals!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Selling Products */}
      {topSellingProducts.length > 0 && (
        <section className="py-16 md:py-24 border-t border-slate-100 dark:border-slate-900/50">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-4 text-left">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/10 text-primary shadow-inner">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-bold mb-1">
                    Best Sellers
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Top Selling Products</h2>
                  <p className="text-muted-foreground text-sm">Our most popular items chosen by customers</p>
                </div>
              </div>
              <Link to="/products">
                <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 h-12 px-6 gap-2">
                  View All Best Sellers <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {topSellingProducts.slice(0, 8).map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  {product.total_sold > 0 && (
                    <Badge className="absolute top-4 left-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] border-0 shadow-lg rounded-lg px-2.5 py-0.5">
                      {product.total_sold} Sold
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
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 border-t border-slate-100 dark:border-slate-900/50">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 text-left">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-bold">
                  Featured Offers
                </Badge>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Featured Deals</h2>
                <p className="text-muted-foreground text-sm">Hand-picked exclusive deals and promotional bundles</p>
              </div>
              <Link to="/deals">
                <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 h-12 px-6 gap-2">
                  View All Deals <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDeals.slice(0, 6).map((deal) => (
                <Link key={deal.id} to={`/deals/${deal.slug}`} className="group">
                  <div className="relative overflow-hidden rounded-[28px] border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {deal.banner_image_url || deal.image_url ? (
                        <img
                          src={getStorageUrl(deal.banner_image_url || deal.image_url)}
                          alt={deal.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Star className="h-12 w-12" />
                        </div>
                      )}
                      
                      {deal.discount_percentage && (
                        <Badge className="absolute top-4 right-4 bg-primary text-white border-0 font-extrabold text-xs shadow-lg rounded-xl px-2.5 py-1">
                          -{deal.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow text-left space-y-4">
                      <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors line-clamp-1">
                        {deal.title}
                      </h3>
                      
                      {deal.short_description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {deal.short_description}
                        </p>
                      )}
                      
                      <div className="pt-2 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 text-left">
                          {deal.original_price && deal.deal_price && (
                            <>
                              <span className="text-2xl font-black text-primary">
                                {formatPrice(
                                  deal.deal_price,
                                  siteInfo?.currency_symbol,
                                  'before',
                                  siteInfo?.formatted_currency
                                )}
                              </span>
                              <span className="text-sm text-slate-400 line-through">
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
                          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 rounded-lg px-2.5 py-1 border border-slate-100 dark:border-slate-800 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 text-primary" />
                            <span>{deal.time_remaining} left</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-600 to-purple-800" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2gMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] bg-white/10 rounded-full blur-3xl -z-10 animate-pulse" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm mb-8">
            <Heart className="h-4 w-4 fill-white text-white" />
            <span>Join Our Global Community</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Ready to Upgrade Your Shopping Experience?
          </h2>
          
          <p className="text-lg md:text-xl mb-12 text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Create an account today to get early access to exclusive collection drops, seasonal savings, and zero-hassle returns.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-white text-primary hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] h-14 px-8 rounded-2xl shadow-xl shadow-black/10 text-base font-bold transition-all border-0">
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 h-14 px-8 rounded-2xl text-base font-bold transition-all">
                Browse Full Catalog <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
