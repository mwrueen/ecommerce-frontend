import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useValidateCouponMutation } from '@/hooks/useApi';
import { toast } from 'sonner';
import { Check, X, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CouponInputProps {
  items: Array<{ id: number; quantity: number }>;
  onCouponApplied: (couponData: {
    code: string;
    discount_amount: number;
    subtotal: number;
    total_after_discount: number;
  }) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: {
    code: string;
    discount_amount: number;
  } | null;
}

export const CouponInput = ({
  items,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [validateCoupon, { isLoading }] = useValidateCouponMutation();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const result = await validateCoupon({
        code: couponCode.trim().toUpperCase(),
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      }).unwrap();

      if (result.success && result.data) {
        onCouponApplied({
          code: result.data.coupon.code,
          discount_amount: result.data.discount_amount,
          subtotal: result.data.subtotal,
          total_after_discount: result.data.total_after_discount,
        });
        toast.success(result.message || 'Coupon applied successfully!');
        setCouponCode('');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to apply coupon');
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCouponCode('');
    toast.success('Coupon removed');
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {appliedCoupon ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                    Coupon Applied: {appliedCoupon.code}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    You saved on this order!
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                className="h-8 w-8 p-0 text-green-700 hover:text-green-900 hover:bg-green-100 dark:text-green-300 dark:hover:text-green-100 dark:hover:bg-green-900"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="coupon-code">Have a coupon code?</Label>
            <div className="flex gap-2">
              <Input
                id="coupon-code"
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyCoupon();
                  }
                }}
                className="flex-1 uppercase"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isLoading || !couponCode.trim()}
                size="default"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

