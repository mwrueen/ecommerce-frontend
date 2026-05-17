import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { clearCart, applyCoupon, removeCoupon } from '@/store/slices/cartSlice';
import { useCreateOrderMutation } from '@/store/api/ordersApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';
import { PaymentGateway } from '@/components/PaymentGateway';
import { CouponInput } from '@/components/CouponInput';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { items, total, coupon } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { data: settings } = useGetPublicSettingsQuery({});

  const [formData, setFormData] = useState({
    shipping_address: user?.address || '',
    notes: '',
  });
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  const subtotal = coupon ? coupon.total_after_discount : total;
  const totalAmount = 
    subtotal + 
    (subtotal >= parseFloat(settings?.data?.free_shipping_threshold || '0') ? 0 : parseFloat(settings?.data?.shipping_cost || '0')) +
    (settings?.data?.tax_inclusive ? 0 : (subtotal * (parseFloat(settings?.data?.tax_rate || '0') / 100)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast.error('Please login to place an order');
      navigate('/customer/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Show payment gateway instead of directly creating order
    setShowPaymentGateway(true);
  };

  const handlePaymentComplete = async () => {
    try {
      const orderData: any = {
        customer_id: user.id,
        shipping_address: formData.shipping_address,
        notes: formData.notes,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      // Add coupon code if applied
      if (coupon?.code) {
        orderData.coupon_code = coupon.code;
      }

      await createOrder(orderData).unwrap();
      
      setShowPaymentGateway(false);
      toast.success('Payment successful! Order placed.');
      dispatch(clearCart());
      navigate('/');
    } catch (error: any) {
      setShowPaymentGateway(false);
      toast.error(error?.data?.message || 'Failed to place order');
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/customer/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={user?.name} disabled />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={user?.phone || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="address">Shipping Address *</Label>
                  <Textarea
                    id="address"
                    required
                    value={formData.shipping_address}
                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                    placeholder="Enter your full shipping address"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <RichTextEditor
                    value={formData.notes}
                    onChange={(value) => setFormData({ ...formData, notes: value })}
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-4">
            <CouponInput
              items={items.map((item) => ({ id: item.id, quantity: item.quantity }))}
              onCouponApplied={(couponData) => dispatch(applyCoupon(couponData))}
              onCouponRemoved={() => dispatch(removeCoupon())}
              appliedCoupon={coupon ? { code: coupon.code, discount_amount: coupon.discount_amount } : null}
            />

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <div className="flex gap-2">
                        {item.original_price && item.original_price !== item.price && (
                          <span className="text-muted-foreground line-through">
                            {formatPrice(
                              parseFloat(item.original_price) * item.quantity,
                              settings?.data?.currency_symbol,
                              settings?.data?.currency_position,
                              settings?.data?.formatted_currency
                            )}
                          </span>
                        )}
                        <span>
                          {formatPrice(
                            parseFloat(item.price) * item.quantity,
                            settings?.data?.currency_symbol,
                            settings?.data?.currency_position,
                            settings?.data?.formatted_currency
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

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
                    {subtotal >= parseFloat(settings?.data?.free_shipping_threshold || '0') ? (
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
                  {subtotal < parseFloat(settings?.data?.free_shipping_threshold || '0') && (
                    <div className="text-xs text-muted-foreground px-1">
                      Add {formatPrice(
                        parseFloat(settings?.data?.free_shipping_threshold || '0') - subtotal,
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
                        settings?.data?.tax_inclusive ? 0 : (subtotal * (parseFloat(settings?.data?.tax_rate || '0') / 100)),
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
                      totalAmount,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}
                  </span>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>

        <PaymentGateway
          open={showPaymentGateway}
          onClose={() => setShowPaymentGateway(false)}
          onPaymentComplete={handlePaymentComplete}
          amount={totalAmount}
          currencySymbol={settings?.data?.currency_symbol}
          currencyPosition={settings?.data?.currency_position}
          formattedCurrency={settings?.data?.formatted_currency}
        />
      </div>
    </div>
  );
};

export default Checkout;
