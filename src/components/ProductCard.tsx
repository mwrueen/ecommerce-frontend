import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';
import { cn, getStorageUrl } from '@/lib/utils';

interface ProductCardProps {
  product: any;
  compact?: boolean;
}

const ProductCard = ({ product, compact = false }: ProductCardProps) => {
  const dispatch = useDispatch();
  const { data: settings } = useGetPublicSettingsQuery({});

  const productImage = product.media?.find((m: any) => m.is_thumbnail)?.url ||
    product.media?.[0]?.url ||
    product.image_url;

  const deal = product.active_deal;
  let discountedPrice = product.price;
  if (deal) {
    if (deal.discount_type === 'percentage') {
      discountedPrice = product.price * (1 - deal.discount_value / 100);
    } else {
      discountedPrice = Math.max(0, product.price - deal.discount_value);
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: String(discountedPrice),
      original_price: String(product.price),
      quantity: 1,
      image_url: productImage,
      slug: product.slug,
    }));
    toast.success('Added to cart');
  };

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity < 10 && product.stock_quantity > 0;

  return (
    <Link to={`/products/${product.slug}`}>
      <Card className={cn(
        "group overflow-hidden rounded-2xl border border-slate-100 bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        compact && "rounded-xl"
      )}>
        <div className={cn("relative overflow-hidden bg-muted", compact ? "aspect-[5/4]" : "aspect-[4/3]")}>
          {productImage ? (
            <img
              src={getStorageUrl(productImage)}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-8 w-8 opacity-40" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick action buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7 rounded-lg bg-white/90 hover:bg-white shadow-md text-slate-700"
              onClick={(e) => { e.preventDefault(); }}
            >
              <Heart className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7 rounded-lg bg-white/90 hover:bg-white shadow-md text-slate-700"
              onClick={(e) => { e.preventDefault(); }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Badges */}
          {isLowStock && (
            <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600 border-0 shadow-sm text-[9px] font-bold px-2 py-0.5">
              Only {product.stock_quantity} left
            </Badge>
          )}
          {isOutOfStock && (
            <Badge className="absolute top-2 left-2 bg-slate-900 hover:bg-slate-800 border-0 shadow-sm text-[9px] font-bold px-2 py-0.5">
              Out of Stock
            </Badge>
          )}

          {/* Category badge */}
          {product.category && (
            <Badge
              variant="secondary"
              className="absolute bottom-2 left-2 bg-white/90 text-foreground border-0 shadow-md text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {product.category.name}
            </Badge>
          )}

          {/* Deal badge */}
          {deal && (
            <Badge
              className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 border-0 shadow-sm text-[9px] font-bold px-2 py-0.5"
            >
              {deal.discount_type === 'percentage' ? `${deal.discount_value}% OFF` : `-${formatPrice(deal.discount_value, settings?.data?.currency_symbol, settings?.data?.currency_position, settings?.data?.formatted_currency)}`}
            </Badge>
          )}
        </div>

        <CardContent className={cn("p-3.5 space-y-1.5", compact && "p-2.5 sm:p-3 space-y-1")}>
          <h3 className={cn("font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors text-slate-900 dark:text-white", compact && "text-xs font-semibold")}>
            {product.name}
          </h3>
          {product.description && (
            <div
              className="text-[11px] text-muted-foreground line-clamp-1 leading-normal"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={cn("text-base font-black text-primary", compact && "text-sm sm:text-base font-extrabold")}>
                {formatPrice(
                  discountedPrice,
                  settings?.data?.currency_symbol,
                  settings?.data?.currency_position,
                  settings?.data?.formatted_currency
                )}
              </span>
              {deal && (
                <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
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
        </CardContent>

        <CardFooter className={cn("p-3.5 pt-0", compact && "p-2.5 pt-0")}>
          <Button
            className={cn(
              "w-full gap-1.5 rounded-xl h-9 text-xs font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg",
              compact && "h-8 text-[11px] rounded-lg"
            )}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
