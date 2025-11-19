import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface PaymentGatewayProps {
  open: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  amount: number;
  currencySymbol?: string;
  currencyPosition?: 'before' | 'after';
  formattedCurrency?: string;
}

export const PaymentGateway = ({
  open,
  onClose,
  onPaymentComplete,
  amount,
  currencySymbol,
  currencyPosition,
  formattedCurrency,
}: PaymentGatewayProps) => {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setProcessing(false);
    onPaymentComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handlePayment} className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
            <div className="text-2xl font-bold">
              {formatPrice(amount, currencySymbol, currencyPosition, formattedCurrency)}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  required
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={3}
                  type="password"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Demo Payment Gateway</p>
            <p className="text-xs">This is a dummy payment interface. Use any card details.</p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={processing}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={processing}>
              {processing ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
