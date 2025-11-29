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
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: any;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useDispatch();
  const { data: settings } = useGetPublicSettingsQuery({});

  // Get thumbnail or first media image
  const productImage = product.media?.find((m: any) => m.is_thumbnail)?.url ||
                       product.media?.[0]?.url ||
                       product.image_url;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
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
        "group overflow-hidden rounded-2xl border-0 bg-card shadow-lg",
        "transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      )}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-xl bg-white/90 hover:bg-white shadow-lg"
              onClick={(e) => { e.preventDefault(); }}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-xl bg-white/90 hover:bg-white shadow-lg"
              onClick={(e) => { e.preventDefault(); }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Stock badges */}
          {isLowStock && (
            <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-600 border-0 shadow-lg text-[10px] font-semibold">
              Only {product.stock_quantity} left
            </Badge>
          )}
          {isOutOfStock && (
            <Badge className="absolute top-3 left-3 bg-slate-900 hover:bg-slate-800 border-0 shadow-lg text-[10px] font-semibold">
              Out of Stock
            </Badge>
          )}

          {/* Category badge */}
          {product.category && (
            <Badge
              variant="secondary"
              className="absolute bottom-3 left-3 bg-white/90 text-foreground border-0 shadow-lg text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {product.category.name}
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <div
              className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xl font-bold text-primary">
              {formatPrice(
                product.price,
                settings?.data?.currency_symbol,
                settings?.data?.currency_position,
                settings?.data?.formatted_currency
              )}
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className={cn(
              "w-full gap-2 rounded-xl h-11 font-semibold transition-all",
              "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
            )}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="h-4 w-4" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
