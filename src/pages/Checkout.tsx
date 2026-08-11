import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { clearCart, applyCoupon, removeCoupon } from '@/store/slices/cartSlice';
import { useCreateOrderMutation } from '@/store/api/ordersApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useGetPublicSettingsQuery } from '@/hooks/useApi';
import { formatPrice } from '@/lib/currency';
import { PaymentGateway } from '@/components/PaymentGateway';
import { CouponInput } from '@/components/CouponInput';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  MapPin, 
  FileText, 
  ShoppingBag, 
  ArrowLeft, 
  Lock 
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  const subtotal = coupon ? coupon.total_after_discount : total;
  const freeShippingThreshold = parseFloat(settings?.data?.free_shipping_threshold || '0');
  const isFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : parseFloat(settings?.data?.shipping_cost || '0');
  const taxRate = parseFloat(settings?.data?.tax_rate || '0');
  const taxInclusive = settings?.data?.tax_inclusive || false;
  const taxAmount = taxInclusive ? 0 : (subtotal * (taxRate / 100));
  const totalAmount = subtotal + shippingCost + taxAmount;

  const handlePlaceOrder = async () => {
    try {
      const orderData: any = {
        customer_id: user?.id,
        shipping_address: formData.shipping_address,
        notes: formData.notes,
        payment_method: paymentMethod,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      if (coupon?.code) {
        orderData.coupon_code = coupon.code;
      }

      const res = await createOrder(orderData).unwrap();
      const createdOrder = res?.data || res?.order;
      const orderId = createdOrder?.id || res?.id;

      dispatch(clearCart());
      toast.success(
        paymentMethod === 'cod' 
          ? '🎉 Order placed successfully with Cash on Delivery!' 
          : '🎉 Payment successful! Order placed.'
      );

      if (orderId) {
        navigate(`/orders/${orderId}?success=true`);
      } else {
        navigate('/orders');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to place order. Please try again.');
    }
  };

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

    if (!formData.shipping_address.trim()) {
      toast.error('Please enter a valid shipping address');
      return;
    }

    if (paymentMethod === 'card') {
      setShowPaymentGateway(true);
    } else {
      await handlePlaceOrder();
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/customer/login" replace state={{ from: location.pathname }} />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="h-20 w-20 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Your Cart is Empty</h2>
          <p className="text-sm text-muted-foreground">Add items to your cart before proceeding to checkout.</p>
          <Link to="/products">
            <Button size="lg" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:underline font-semibold mb-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Cart
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Secure Express Checkout</h1>
            <p className="text-xs sm:text-sm text-slate-400">Complete your order details and choose your preferred payment option.</p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 font-bold text-xs flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="h-4 w-4" /> 256-Bit SSL Encrypted
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Shipping Address */}
            <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
              <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  1. Shipping Information
                </CardTitle>
                <CardDescription>Enter the address where you want your order delivered.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground">Recipient Name</Label>
                    <Input id="name" value={user?.name} disabled className="mt-1 font-semibold rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground">Email Address</Label>
                    <Input id="email" type="email" value={user?.email} disabled className="mt-1 font-semibold rounded-xl" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground">Phone Number</Label>
                  <Input id="phone" value={user?.phone || 'N/A'} disabled className="mt-1 font-semibold rounded-xl" />
                </div>

                <div>
                  <Label htmlFor="address" className="text-xs font-bold uppercase text-muted-foreground">
                    Full Shipping Address <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    required
                    rows={3}
                    value={formData.shipping_address}
                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                    placeholder="House/Apartment #, Street, City, District, Zip Code"
                    className="mt-1 rounded-xl focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-xs font-bold uppercase text-muted-foreground">Order Delivery Notes (Optional)</Label>
                  <RichTextEditor
                    value={formData.notes}
                    onChange={(value) => setFormData({ ...formData, notes: value })}
                    placeholder="Special instructions for delivery (e.g. Call before delivery, drop at front door)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Payment Method Selection */}
            <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
              <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  2. Select Payment Method
                </CardTitle>
                <CardDescription>Choose how you would like to pay for this order.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Cash on Delivery Option */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={cn(
                      "relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3",
                      paymentMethod === 'cod'
                        ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-lg shadow-emerald-500/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-card"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          <Banknote className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-foreground">Cash on Delivery</h4>
                          <p className="text-[11px] text-muted-foreground">Pay upon receiving</p>
                        </div>
                      </div>
                      <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", paymentMethod === 'cod' ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-slate-700")}>
                        {paymentMethod === 'cod' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                      Hand over exact cash to the courier agent when your package is delivered to your shipping address.
                    </p>
                    <Badge className="w-fit bg-emerald-600 text-white font-bold text-[10px]">NO ADVANCE PAYMENT NEEDED</Badge>
                  </div>

                  {/* Online Credit/Debit Card Option */}
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3",
                      paymentMethod === 'card'
                        ? "border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-card"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-foreground">Credit / Debit Card</h4>
                          <p className="text-[11px] text-muted-foreground">Instant online payment</p>
                        </div>
                      </div>
                      <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", paymentMethod === 'card' ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-300 dark:border-slate-700")}>
                        {paymentMethod === 'card' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                      Pay securely online using Visa, Mastercard, or local mobile banking options.
                    </p>
                    <Badge className="w-fit bg-indigo-600 text-white font-bold text-[10px]">INSTANT DISPATCH</Badge>
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Coupon Code Input */}
            <CouponInput
              items={items.map((item) => ({ id: item.id, quantity: item.quantity }))}
              onCouponApplied={(couponData) => dispatch(applyCoupon(couponData))}
              onCouponRemoved={() => dispatch(removeCoupon())}
              appliedCoupon={coupon ? { code: coupon.code, discount_amount: coupon.discount_amount } : null}
            />

            {/* Order Summary Card */}
            <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <CardTitle className="text-lg font-extrabold">Order Summary ({items.length} items)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                
                {/* Items List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-xs text-foreground line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-xs text-foreground shrink-0">
                        {formatPrice(
                          parseFloat(item.price) * item.quantity,
                          settings?.data?.currency_symbol,
                          settings?.data?.currency_position,
                          settings?.data?.formatted_currency
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Costs Breakdown */}
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span className="text-foreground font-bold">
                      {formatPrice(
                        total,
                        settings?.data?.currency_symbol,
                        settings?.data?.currency_position,
                        settings?.data?.formatted_currency
                      )}
                    </span>
                  </div>

                  {coupon && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount ({coupon.code})</span>
                      <span className="font-bold">
                        -{formatPrice(
                          coupon.discount_amount,
                          settings?.data?.currency_symbol,
                          settings?.data?.currency_position,
                          settings?.data?.formatted_currency
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping Fee</span>
                    {isFreeShipping ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">FREE SHIPPING</span>
                    ) : (
                      <span className="text-foreground font-bold">
                        {formatPrice(
                          shippingCost,
                          settings?.data?.currency_symbol,
                          settings?.data?.currency_position,
                          settings?.data?.formatted_currency
                        )}
                      </span>
                    )}
                  </div>

                  {taxRate > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax ({taxRate}%{taxInclusive ? ' Included' : ''})</span>
                      <span className="text-foreground font-bold">
                        {formatPrice(
                          taxAmount,
                          settings?.data?.currency_symbol,
                          settings?.data?.currency_position,
                          settings?.data?.formatted_currency
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Final Total */}
                <div className="flex justify-between items-center py-1">
                  <div>
                    <p className="text-xs uppercase font-bold text-muted-foreground">Total Payable Amount</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      {paymentMethod === 'cod' ? 'Pay Cash on Arrival' : 'Pay Online Now'}
                    </p>
                  </div>
                  <span className="text-2xl font-black text-primary">
                    {formatPrice(
                      totalAmount,
                      settings?.data?.currency_symbol,
                      settings?.data?.currency_position,
                      settings?.data?.formatted_currency
                    )}
                  </span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className={cn(
                    "w-full rounded-2xl h-13 font-black text-sm shadow-xl transition-all border-0",
                    paymentMethod === 'cod'
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/20"
                  )}
                >
                  {isLoading
                    ? 'Placing Order...'
                    : paymentMethod === 'cod'
                    ? 'Confirm Order (Cash on Delivery)'
                    : 'Proceed to Card Payment'}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Satisfaction Guaranteed • 30-Day Express Returns</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </form>

        <PaymentGateway
          open={showPaymentGateway}
          onClose={() => setShowPaymentGateway(false)}
          onPaymentComplete={handlePlaceOrder}
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
