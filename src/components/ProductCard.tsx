import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';

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

  return (
    <Link to={`/products/${product.slug}`}>
      <Card className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-10 w-10" />
            </div>
          )}
          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <Badge className="absolute top-2 right-2 text-[10px] px-2 py-0.5" variant="destructive">
              Only {product.stock_quantity} left
            </Badge>
          )}
          {product.stock_quantity === 0 && (
            <Badge className="absolute top-2 right-2 text-[10px] px-2 py-0.5" variant="secondary">
              Out of Stock
            </Badge>
          )}
        </div>
        <CardContent className="p-3 space-y-2">
          <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <div 
              className="text-xs text-muted-foreground line-clamp-2"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {formatPrice(
                product.price,
                settings?.data?.currency_symbol,
                settings?.data?.currency_position,
                settings?.data?.formatted_currency
              )}
            </span>
            {product.category && (
              <Badge variant="secondary" className="text-[10px]">
                {product.category.name}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0">
          <Button
            className="w-full gap-2"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
