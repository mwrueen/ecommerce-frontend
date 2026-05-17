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

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link to="/products">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
              {(selectedImage || productImage) ? (
                <img
                  src={getStorageUrl(selectedImage || productImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Package className="h-32 w-32" />
                </div>
              )}
            </div>
            {product.media && product.media.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.media.map((media: any) => (
                  <div
                    key={media.id}
                    className={`aspect-square rounded-lg overflow-hidden bg-secondary cursor-pointer hover:opacity-75 transition-opacity border-2 ${(selectedImage || productImage) === media.url ? 'border-primary' : 'border-transparent'
                      }`}
                    onClick={() => setSelectedImage(media.url)}
                  >
                    <img src={getStorageUrl(media.url)} alt={media.alt_text || product.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex gap-2 mb-2">
                {product.category && (
                  <Badge variant="secondary">
                    {product.category.name}
                  </Badge>
                )}
                {deal && (
                  <Badge className="bg-red-500 hover:bg-red-600 border-0 shadow-sm text-xs font-semibold">
                    {deal.discount_type === 'percentage' ? `${deal.discount_value}% OFF` : `-${formatPrice(deal.discount_value, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}`}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.brand && (
                <p className="text-muted-foreground">Brand: {product.brand}</p>
              )}
            </div>

            <div className="flex items-baseline gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(
                    discountedPrice,
                    settings?.data?.currency_symbol,
                    settings?.data?.currency_position,
                    settings?.data?.formatted_currency
                  )}
                </span>
                {deal && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(
                      product.price,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}
                  </span>
                )}
              </div>
              {product.stock_quantity > 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  In Stock ({product.stock_quantity} available)
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <div
                className="text-muted-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
              {product.long_description && (
                <div
                  className="text-muted-foreground mt-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.long_description }}
                />
              )}
            </div>

            {product.sku && (
              <div className="text-sm text-muted-foreground">
                SKU: {product.sku}
              </div>
            )}

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Quantity</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $50</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% protected</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30-day guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
