import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { removeFromCart, updateQuantity, applyCoupon, removeCoupon } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';
import { CouponInput } from '@/components/CouponInput';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, total, coupon } = useSelector((state: RootState) => state.cart);
  const { data: settings } = useGetPublicSettingsQuery({});

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <Link to={`/products/${item.slug}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(
                            item.price,
                            settings?.data?.currency_symbol,
                            settings?.data?.currency_position,
                            settings?.data?.formatted_currency
                          )}
                        </p>
                        {item.original_price && item.original_price !== item.price && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(
                              item.original_price,
                              settings?.data?.currency_symbol,
                              settings?.data?.currency_position,
                              settings?.data?.formatted_currency
                            )}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive gap-2"
                          onClick={() => dispatch(removeFromCart(item.id))}
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        {formatPrice(
                          parseFloat(item.price) * item.quantity,
                          settings?.data?.currency_symbol,
                          settings?.data?.currency_position,
                          settings?.data?.formatted_currency
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <CouponInput
              items={items.map((item) => ({ id: item.id, quantity: item.quantity }))}
              onCouponApplied={(couponData) => dispatch(applyCoupon(couponData))}
              onCouponRemoved={() => dispatch(removeCoupon())}
              appliedCoupon={coupon ? { code: coupon.code, discount_amount: coupon.discount_amount } : null}
            />

            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>
                      {formatPrice(
                        total,
                        settings?.data?.currency_symbol,
                        settings?.data?.currency_position,
                        settings?.data?.formatted_currency
                      )}
                    </span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Discount ({coupon.code})</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        -{formatPrice(
                          coupon.discount_amount,
                          settings?.data?.currency_symbol,
                          settings?.data?.currency_position,
                          settings?.data?.formatted_currency
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    {(coupon ? coupon.total_after_discount : total) >= parseFloat(settings?.data?.free_shipping_threshold || '0') ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      <span>
                        {formatPrice(
                          settings?.data?.shipping_cost || '0',
                          settings?.data?.currency_symbol,
                          settings?.data?.currency_position,
                          settings?.data?.formatted_currency
                        )}
                      </span>
                    )}
                  </div>
                  {(coupon ? coupon.total_after_discount : total) < parseFloat(settings?.data?.free_shipping_threshold || '0') && (
                    <div className="text-xs text-muted-foreground px-1">
                      Add {formatPrice(
                        parseFloat(settings?.data?.free_shipping_threshold || '0') - (coupon ? coupon.total_after_discount : total),
                        settings?.data?.currency_symbol,
                        settings?.data?.currency_position,
                        settings?.data?.formatted_currency
                      )} more for free shipping
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax ({settings?.data?.tax_rate || '0'}%{settings?.data?.tax_inclusive ? ' - Inclusive' : ''})</span>
                    <span>
                      {formatPrice(
                        settings?.data?.tax_inclusive ? 0 : ((coupon ? coupon.total_after_discount : total) * (parseFloat(settings?.data?.tax_rate || '0') / 100)),
                        settings?.data?.currency_symbol,
                        settings?.data?.currency_position,
                        settings?.data?.formatted_currency
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(
                      (coupon ? coupon.total_after_discount : total) + 
                      ((coupon ? coupon.total_after_discount : total) >= parseFloat(settings?.data?.free_shipping_threshold || '0') ? 0 : parseFloat(settings?.data?.shipping_cost || '0')) +
                      (settings?.data?.tax_inclusive ? 0 : ((coupon ? coupon.total_after_discount : total) * (parseFloat(settings?.data?.tax_rate || '0') / 100))),
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}
                  </span>
                </div>

                <Link to="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link to="/products" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
