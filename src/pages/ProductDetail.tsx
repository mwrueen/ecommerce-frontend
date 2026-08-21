import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetProductQuery } from '@/store/api/productsApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Minus, Plus, ArrowLeft, Package, Truck, Shield } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';
import { getStorageUrl } from '@/lib/utils';

import SEO from '@/components/SEO';

const ProductDetail = () => {
  const { identifier } = useParams();
  const dispatch = useDispatch();
  const { data: product, isLoading } = useGetProductQuery(identifier!);
  const { data: settings } = useGetPublicSettingsQuery({});
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get thumbnail or first media image
  const productImage = product?.media?.find((m: any) => m.is_thumbnail)?.url ||
    product?.media?.[0]?.url ||
    product?.image_url;

  const deal = product?.active_deal;
  let discountedPrice = product?.price || 0;
  if (product && deal) {
    if (deal.discount_type === 'percentage') {
      discountedPrice = product.price * (1 - deal.discount_value / 100);
    } else {
      discountedPrice = Math.max(0, product.price - deal.discount_value);
    }
  }

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: String(discountedPrice),
      original_price: String(product.price),
      quantity,
      image_url: productImage,
      slug: product.slug,
    }));
    toast.success(`Added ${quantity} item(s) to cart`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <Link to="/products">
            <Button variant="outline">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canonicalProductUrl = `${window.location.origin}/products/${product.slug || product.id}`;
  const fullProductImageUrl = productImage ? getStorageUrl(productImage) : `${window.location.origin}/placeholder.svg`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${window.location.origin}/`,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Products',
        'item': `${window.location.origin}/products`,
      },
      ...(product.category ? [{
        '@type': 'ListItem',
        'position': 3,
        'name': product.category.name,
        'item': `${window.location.origin}/products?category=${product.category.slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        'position': product.category ? 4 : 3,
        'name': product.name,
        'item': canonicalProductUrl,
      },
    ],
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.meta_description || product.short_description || product.description || product.name,
    'image': [fullProductImageUrl],
    'sku': product.sku || product.id?.toString(),
    'mpn': product.sku || product.id?.toString(),
    'brand': {
      '@type': 'Brand',
      'name': settings?.data?.title || 'Store',
    },
    'offers': {
      '@type': 'Offer',
      'url': canonicalProductUrl,
      'priceCurrency': settings?.data?.currency || 'USD',
      'price': String(discountedPrice),
      'priceValidUntil': '2028-12-31',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': product.stock_status === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': settings?.data?.title || 'Store',
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <SEO
        title={product.meta_title || `${product.name} - Buy Online`}
        description={product.meta_description || product.short_description || product.description || `Order ${product.name} at the best price online.`}
        keywords={product.meta_keywords || `${product.name}, buy ${product.name}, ${product.category?.name || 'electronics'}`}
        canonicalUrl={canonicalProductUrl}
        ogType="product"
        ogImage={fullProductImageUrl}
        price={discountedPrice}
        currency={settings?.data?.currency}
        availability={product.stock_status === 'out_of_stock' ? 'OutOfStock' : 'InStock'}
        jsonLd={[breadcrumbSchema, productSchema]}
      />
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Back Link & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/products">
            <Button variant="ghost" className="rounded-xl gap-2 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4" /> Back to Products Catalog
            </Button>
          </Link>
          {product.category && (
            <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-extrabold text-xs">
              Category: {product.category.name}
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Media Gallery (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              {(selectedImage || productImage) ? (
                <img
                  src={getStorageUrl(selectedImage || productImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Package className="h-28 w-28 opacity-40" />
                </div>
              )}
              {deal && (
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white border-0 font-black text-xs px-3 py-1 shadow-lg">
                  {deal.discount_type === 'percentage' ? `${deal.discount_value}% OFF` : `-${formatPrice(deal.discount_value, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}`}
                </Badge>
              )}
            </div>

            {product.media && product.media.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.media.map((media: any) => (
                  <div
                    key={media.id}
                    className={`aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-900 cursor-pointer hover:opacity-90 transition-all border-2 ${
                      (selectedImage || productImage) === media.url ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'
                    }`}
                    onClick={() => setSelectedImage(media.url)}
                  >
                    <img src={getStorageUrl(media.url)} alt={media.alt_text || product.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions (7 cols) */}
          <div className="md:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {product.brand && (
                  <Badge variant="outline" className="rounded-lg text-[11px] uppercase font-bold tracking-wider">
                    {product.brand}
                  </Badge>
                )}
                {product.stock_quantity > 0 ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                    In Stock ({product.stock_quantity} available)
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="font-bold text-xs">Out of Stock</Badge>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
                {product.name}
              </h1>
              
              {product.sku && (
                <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>
              )}
            </div>

            {/* Pricing Section */}
            <div className="p-5 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Special Price</p>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-amber-400">
                    {formatPrice(
                      discountedPrice,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}
                  </span>
                  {deal && (
                    <span className="text-sm sm:text-base text-slate-500 line-through">
                      {formatPrice(
                        product.price,
                        settings?.data?.currency_symbol,
                        settings?.data?.currency_position,
                        settings?.data?.formatted_currency
                      )}
                    </span>
                  )}
                </div>
              </div>
              {deal && (
                <Badge className="bg-rose-500 text-white font-extrabold text-xs px-3 py-1.5 shadow-md">
                  SAVE UP TO {deal.discount_type === 'percentage' ? `${deal.discount_value}%` : `$${deal.discount_value}`}
                </Badge>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold uppercase text-muted-foreground tracking-wide">Overview</h3>
              <div
                className="text-sm text-foreground/90 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
              {product.long_description && (
                <div
                  className="text-sm text-muted-foreground leading-relaxed mt-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.long_description }}
                />
              )}
            </div>

            {/* Quantity Selector & Add to Cart */}
            <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-foreground">Select Quantity</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-slate-300 dark:border-slate-700"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-extrabold text-base">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-slate-300 dark:border-slate-700"
                      onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold text-base shadow-xl shadow-rose-500/20 border-0 gap-2 transition-all hover:scale-[1.01]"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Shopping Cart'}
                </Button>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-md space-y-1">
                <Truck className="h-6 w-6 mx-auto text-indigo-500" />
                <p className="text-xs font-bold text-foreground">Fast Delivery</p>
                <p className="text-[10px] text-muted-foreground">Doorstep dispatch</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-md space-y-1">
                <Shield className="h-6 w-6 mx-auto text-emerald-500" />
                <p className="text-xs font-bold text-foreground">100% Secure</p>
                <p className="text-[10px] text-muted-foreground">Encrypted Checkout</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-md space-y-1">
                <Package className="h-6 w-6 mx-auto text-amber-500" />
                <p className="text-xs font-bold text-foreground">Easy Returns</p>
                <p className="text-[10px] text-muted-foreground">30-day guarantee</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
