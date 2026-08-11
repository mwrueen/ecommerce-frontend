import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  Shield, 
  Star, 
  Clock, 
  Zap, 
  TrendingUp, 
  Sparkles, 
  Gift, 
  Heart,
  FolderTree,
  ChevronRight,
  Flame,
  Percent,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useGetLandingPageDataQuery } from '@/store/api/landingApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import ProductCard from '@/components/ProductCard';
import Autoplay from 'embla-carousel-autoplay';
import { formatPrice } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, getStorageUrl } from '@/lib/utils';

const Index = () => {
  const { data: landingData, isLoading, error } = useGetLandingPageDataQuery();
  const { data: categoriesData } = useGetCategoriesQuery({ paginate: false });
  const [activeTab, setActiveTab] = useState<'all' | 'best' | 'latest' | 'deals'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
  const allCategories = categoriesData?.data || categoriesData || featuredCategories;
  const latestProducts = landingData?.data?.latest_products || [];
  const topSellingProducts = landingData?.data?.top_selling_products || [];
  const featuredDeals = landingData?.data?.featured_deals || [];
  const flashDeals = landingData?.data?.flash_deals || [];
  const sliderImages = heroSection?.slider_images || [];

  const mockup = heroSection?.mockup || {
    badge: 'Special Offer',
    product_name: 'VibePro Wireless ANC Headphones',
    product_description: 'Experience audio purity with flagship noise cancellation.',
    price: '299.00',
    discount: 'Save 25%',
    rating: '4.9',
    happy_users: '10K+',
    link: '/products',
  };

  // Combine products for main showcase
  let displayedProducts = [...topSellingProducts, ...latestProducts];
  // Remove duplicates by ID
  const productMap = new Map();
  displayedProducts.forEach(p => productMap.set(p.id, p));
  const uniqueProducts = Array.from(productMap.values());

  let filteredProducts = uniqueProducts;
  if (activeTab === 'best') {
    filteredProducts = topSellingProducts.length > 0 ? topSellingProducts : uniqueProducts;
  } else if (activeTab === 'latest') {
    filteredProducts = latestProducts.length > 0 ? latestProducts : uniqueProducts;
  }

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(p => 
      p.category?.slug === selectedCategory || p.category_id?.toString() === selectedCategory
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background overflow-x-hidden">
      
      {/* Top Prominent Offer Ticker Bar */}
      <div className="bg-slate-950 text-slate-100 border-b border-amber-500/30 py-2.5 px-4 shadow-lg relative z-20">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 truncate">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold px-3 py-1 text-[11px] rounded-full shadow-md shadow-rose-500/20 shrink-0">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>HOT OFFERS</span>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
              Exclusive Season Sale: <span className="text-amber-400 font-bold">Get Up to 50% OFF</span> on Top Selling Products! Free Shipping on orders over <span className="text-emerald-400 font-bold">{siteInfo?.free_shipping_threshold ? formatPrice(siteInfo.free_shipping_threshold.toString(), siteInfo.currency_symbol, 'before', siteInfo.formatted_currency) : '$50'}</span>.
            </span>
          </div>
          <Link to="/deals" className="hidden sm:inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs px-3 py-1 rounded-full font-extrabold transition-all shrink-0">
            View Offers <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Hero Section & Featured Offer Widget */}
      <section className="w-full relative py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Main Hero Banner / Slider (8 cols) */}
            <div className="lg:col-span-8 flex flex-col">
              {sliderImages.length > 0 ? (
                <Carousel
                  opts={{ align: "start", loop: true }}
                  plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
                  className="w-full h-full"
                >
                  <CarouselContent className="rounded-3xl border bg-card shadow-2xl shadow-primary/5 h-full">
                    {sliderImages.map((slider: any, index: number) => (
                      <CarouselItem key={index} className="h-full">
                        <div className="relative w-full h-[320px] sm:h-[400px] lg:h-full min-h-[380px] rounded-3xl overflow-hidden group">
                          <img
                            src={getStorageUrl(slider.image)}
                            alt={slider.title || `Slider ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                            <div className="max-w-xl space-y-3 rounded-2xl border border-white/20 bg-white/10 p-5 md:p-6 text-white shadow-2xl backdrop-blur-xl">
                              {slider.title && (
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight tracking-tight text-white">
                                  {slider.title}
                                </h2>
                              )}
                              {slider.subtitle && (
                                <p className="text-xs sm:text-sm text-white/90 line-clamp-2">
                                  {slider.subtitle}
                                </p>
                              )}
                              <div className="pt-2">
                                <Link to={slider.hyperlink || '/products'}>
                                  <Button size="sm" className="rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white hover:opacity-95 shadow-lg border-0 font-bold gap-2">
                                    Shop Now <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 hidden sm:flex h-10 w-10 rounded-xl bg-white/90 hover:bg-white shadow-lg border-0" />
                  <CarouselNext className="right-4 hidden sm:flex h-10 w-10 rounded-xl bg-white/90 hover:bg-white shadow-lg border-0" />
                </Carousel>
              ) : (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-10 shadow-2xl flex flex-col justify-between h-full min-h-[380px]">
                  <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
                  <div className="relative z-10 space-y-4 max-w-xl text-left">
                    <Badge className="bg-white/10 text-indigo-200 border-white/20 font-bold px-3 py-1 gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>{heroSection?.tagline || 'Premium Quality Online Store'}</span>
                    </Badge>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                      {heroSection?.title || 'Discover Top Quality Products'}
                    </h1>
                    <p className="text-indigo-200/90 text-sm sm:text-base leading-relaxed line-clamp-3">
                      Explore our hand-picked items, exclusive deals, and fast doorstep delivery.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Link to="/products">
                        <Button size="lg" className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold gap-2 shadow-xl shadow-indigo-500/30">
                          <ShoppingBag className="h-4 w-4" /> Shop Catalog <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to="/deals">
                        <Button size="lg" className="rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold gap-2 backdrop-blur-md transition-all">
                          View Deals
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Highlighted Deal / Special Offer Card (4 cols) */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-indigo-500/30 p-6 shadow-2xl flex flex-col justify-between h-full">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Flame className="h-40 w-40 text-amber-500" />
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                  <Badge className="bg-gradient-to-r from-amber-500 to-rose-600 text-white border-0 font-extrabold text-xs px-3 py-1 flex gap-1 items-center shadow-md">
                    <Flame className="h-3.5 w-3.5 fill-current" />
                    <span>DEAL OF THE DAY</span>
                  </Badge>
                  {mockup.discount && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
                      {mockup.discount}
                    </Badge>
                  )}
                </div>

                <div className="my-6 space-y-4 relative z-10 text-left">
                  <h3 className="text-xl font-extrabold text-white tracking-tight line-clamp-2">
                    {flashDeals[0]?.title || mockup.product_name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {flashDeals[0]?.short_description || mockup.product_description}
                  </p>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Offer Price</p>
                      <p className="text-2xl font-black text-amber-400">
                        {flashDeals[0]?.deal_price 
                          ? formatPrice(flashDeals[0].deal_price, siteInfo?.currency_symbol, 'before', siteInfo?.formatted_currency)
                          : `${siteInfo?.currency_symbol || '$'}${mockup.price}`
                        }
                      </p>
                    </div>
                    {flashDeals[0]?.original_price && (
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Regular</p>
                        <p className="text-sm font-semibold text-slate-500 line-through">
                          {formatPrice(flashDeals[0].original_price, siteInfo?.currency_symbol, 'before', siteInfo?.formatted_currency)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10 relative z-10">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-amber-300 font-semibold">
                      <Clock className="h-3.5 w-3.5" /> Limited Time Remaining
                    </span>
                    <span className="font-bold text-white">Act Fast</span>
                  </div>

                  <Link to={flashDeals[0] ? `/deals/${flashDeals[0].slug}` : '/deals'} className="block">
                    <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold shadow-lg shadow-rose-500/20 border-0 gap-2">
                      <Zap className="h-4 w-4 fill-current" /> Claim This Offer Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Prominent Highlighted Offers & Flash Deals Section */}
      {(() => {
        const offersList = flashDeals.length > 0 
          ? flashDeals 
          : featuredDeals.length > 0 
          ? featuredDeals 
          : uniqueProducts.slice(0, 4).map(p => ({
              id: p.id,
              slug: p.slug,
              title: p.name,
              image_url: p.featured_image || p.image,
              discount_percentage: 20,
              deal_price: p.sale_price || p.price,
              original_price: p.regular_price || p.price ? (parseFloat(p.price) * 1.25).toFixed(2) : null
            }));

        if (offersList.length === 0) return null;

        return (
          <section className="py-8 relative">
            <div className="container mx-auto px-4">
              <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl p-6 sm:p-8">
                <div className="absolute top-0 right-0 h-96 w-96 bg-gradient-to-bl from-amber-500/15 via-rose-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-rose-500 to-amber-500 text-white border-0 font-bold px-2.5 py-0.5 text-[11px] shadow-sm">
                        <Percent className="h-3 w-3 mr-1" /> EXCLUSIVE OFFERS & DEALS
                      </Badge>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Highlighted Offers & Savings</h2>
                  </div>
                  <Link to="/deals">
                    <Button size="sm" className="rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-1.5 shrink-0 font-bold backdrop-blur-md transition-all">
                      Explore All Offers <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
                  {offersList.slice(0, 4).map((deal: any) => (
                    <Link key={deal.id} to={deal.slug ? `/deals/${deal.slug}` : '/products'} className="group block">
                      <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/50 hover:bg-white/10 flex flex-col p-4">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-3">
                          {deal.image_url || deal.banner_image_url ? (
                            <img
                              src={getStorageUrl(deal.image_url || deal.banner_image_url)}
                              alt={deal.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-600">
                              <Tag className="h-10 w-10" />
                            </div>
                          )}
                          {deal.discount_percentage && (
                            <Badge className="absolute top-2.5 left-2.5 bg-rose-600 text-white border-0 font-extrabold text-[10px] px-2 py-0.5 shadow-md">
                              -{deal.discount_percentage}% OFF
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-300 transition-colors text-left">
                          {deal.title}
                        </h3>
                        
                        <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/10">
                          <div>
                            <span className="text-base font-black text-amber-400">
                              {formatPrice(deal.deal_price || deal.price, siteInfo?.currency_symbol, 'before', siteInfo?.formatted_currency)}
                            </span>
                            {deal.original_price && (
                              <span className="text-xs text-slate-500 line-through ml-1.5">
                                {formatPrice(deal.original_price, siteInfo?.currency_symbol, 'before', siteInfo?.formatted_currency)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                            Claim Offer
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Main Showcase Section: Categories at Side & Highlighted Products */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Side: Categories Navigation Sidebar (3 cols) */}
            <div className="lg:col-span-3 space-y-6 sticky top-20 z-20">
              <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-card overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-indigo-400" />
                    <h3 className="font-extrabold text-sm tracking-tight">Categories</h3>
                  </div>
                  <Badge className="bg-white/10 text-indigo-200 border-0 text-[10px] font-bold">
                    {allCategories.length} Total
                  </Badge>
                </div>
                <CardContent className="p-3 space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                      selectedCategory === null
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-indigo-400" /> All Categories
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  </button>

                  {allCategories.map((cat: any) => (
                    <button
                      key={cat.id || cat.slug}
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer",
                        selectedCategory === cat.slug
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {cat.image_url ? (
                          <img 
                            src={getStorageUrl(cat.image_url)} 
                            alt={cat.name} 
                            className="h-5 w-5 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
                          />
                        ) : (
                          <div className="h-5 w-5 rounded-md bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-500 font-bold text-[10px]">
                            {cat.name.charAt(0)}
                          </div>
                        )}
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 shrink-0">
                        {cat.active_products_count || cat.products_count || 0}
                      </Badge>
                    </button>
                  ))}

                  <div className="pt-2">
                    <Link to="/categories" className="block text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline py-2">
                      View All Categories →
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Special Offer Card */}
              <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/20 p-5 text-left space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                  <Gift className="h-4 w-4" />
                  <span>First Order Bonus</span>
                </div>
                <h4 className="font-extrabold text-sm text-foreground">Get 15% OFF Extra</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use coupon code <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">WELCOME15</span> at checkout.
                </p>
                <Link to="/products" className="block pt-1">
                  <Button size="sm" variant="outline" className="w-full rounded-xl text-xs font-bold border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10">
                    Claim Discount
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side: Highlight Products Showcase (9 cols) */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Product Showcase Filter Tabs */}
              <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5 text-left">
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span>Highlighted Products</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedCategory ? `Showing products in selected category` : 'Hand-picked products for maximum value and quality'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-muted p-1 rounded-2xl shrink-0 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                      activeTab === 'all'
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All Products
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('best')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1",
                      activeTab === 'best'
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Flame className="h-3.5 w-3.5 text-amber-500" /> Best Sellers
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('latest')}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1",
                      activeTab === 'latest'
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> New Arrivals
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden rounded-2xl border-0 shadow-lg bg-card">
                      <Skeleton className="aspect-[4/3] w-full" />
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="relative group">
                      <ProductCard product={product} />
                      {product.total_sold > 0 && (
                        <Badge className="absolute top-3 left-3 bg-emerald-500 text-white font-extrabold text-[10px] border-0 shadow-md rounded-lg px-2 py-0.5 pointer-events-none">
                          {product.total_sold} Sold
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <h3 className="font-bold text-base text-foreground">No Products Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Try selecting another category or resetting filters.</p>
                  <Button size="sm" onClick={() => { setSelectedCategory(null); setActiveTab('all'); }}>
                    Reset Filters
                  </Button>
                </div>
              )}

              {/* View Full Catalog Footer Bar */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-extrabold text-base">Looking for more products?</h4>
                  <p className="text-xs text-indigo-200">Browse our complete inventory with advanced filters and instant search.</p>
                </div>
                <Link to="/products">
                  <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 shrink-0">
                    Explore Full Catalog <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-12 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Truck, 
                title: 'Fast & Free Delivery', 
                desc: siteInfo?.free_shipping_threshold ? `Free on orders over ${formatPrice(siteInfo.free_shipping_threshold.toString(), siteInfo.currency_symbol, 'before', siteInfo.formatted_currency)}` : 'Free shipping over $50', 
                color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10',
                glow: 'from-indigo-500/10 to-transparent'
              },
              { 
                icon: Shield, 
                title: '100% Secure Checkout', 
                desc: '256-Bit encrypted payment channels', 
                color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
                glow: 'from-emerald-500/10 to-transparent'
              },
              { 
                icon: Star, 
                title: 'Top Rated Quality', 
                desc: 'Curated 100% authentic products', 
                color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10',
                glow: 'from-amber-500/10 to-transparent'
              },
              { 
                icon: Gift, 
                title: 'Hassle-Free Returns', 
                desc: '30-day money back guarantee', 
                color: 'text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10',
                glow: 'from-purple-500/10 to-transparent'
              },
            ].map((feature, index) => (
              <Card key={index} className="relative overflow-hidden bg-card border border-slate-200 dark:border-slate-800 shadow-xl p-6 rounded-3xl group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/30">
                <div className={cn("absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500", feature.glow)} />
                <div className="flex items-center gap-4 text-left relative z-10">
                  <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-inner transition-transform duration-300 group-hover:scale-110", feature.color)}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base text-foreground tracking-tight">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground leading-snug">{feature.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 relative">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl p-8 sm:p-12 lg:p-16">
            {/* Glowing backdrop elements */}
            <div className="absolute -top-24 -left-24 h-96 w-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-96 w-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              
              {/* Left Column: Copy & Actions */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <Badge className="bg-gradient-to-r from-rose-500 to-amber-500 text-white border-0 font-bold px-3.5 py-1 text-xs shadow-md inline-flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 fill-current" />
                  <span>JOIN OUR SHOPPING COMMUNITY</span>
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                  Ready to Upgrade Your Shopping Experience?
                </h2>
                
                <p className="text-indigo-200 text-sm sm:text-base leading-relaxed max-w-xl">
                  Create a free account today to get early access to exclusive collection drops, secret discount coupons, and instant order tracking.
                </p>

                {/* Member Perks Checkmarks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    'Instant Order Tracking & SMS Updates',
                    'Exclusive Member Discount Codes',
                    '24/7 Priority Customer Support',
                    'Hassle-Free 30-Day Express Returns'
                  ].map((perk, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-slate-200 text-xs font-semibold">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/customer/login?tab=register">
                    <Button size="lg" className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-rose-500/25 border-0 gap-2 hover:scale-[1.02] transition-all">
                      Create Free Account <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/products">
                    <Button size="lg" className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm backdrop-blur-md transition-all">
                      Browse Full Catalog
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Member Benefits Preview Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-5 text-left">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-400" />
                      <h4 className="font-extrabold text-base text-white">Member Privileges</h4>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                      FREE MEMBERSHIP
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm shrink-0">
                        🎁
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">Welcome Gift</p>
                        <p className="text-[11px] text-slate-400">$10 Instant Coupon on Registration</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm shrink-0">
                        ⚡
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">Flash Sale Early Access</p>
                        <p className="text-[11px] text-slate-400">Get 2-Hour Head Start on Deals</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-sm shrink-0">
                        🚚
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">VIP Priority Shipping</p>
                        <p className="text-[11px] text-slate-400">Faster dispatch & order handling</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-center border-t border-white/10">
                    <p className="text-[11px] text-slate-400 font-semibold">
                      ⭐ Joined by over <span className="text-amber-400 font-bold">15,000+</span> happy shoppers worldwide
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
